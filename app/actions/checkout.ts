"use server";

import {
  createCustomer as asaasCreateCustomer,
  updateCustomer as asaasUpdateCustomer,
  createSubscriptionWithCreditCard as asaasCreateSubscriptionWithCreditCard,
  getSubscriptionPayments as asaasGetSubscriptionPayments,
  type Customer,
  type Subscription,
  type Payment,
} from "@/lib/asaas";
import {
  customerSchema,
  creditCardSchema,
  type CustomerFormData,
  type CreditCardFormData,
} from "@/lib/validations";
import { getClientIP } from "@/lib/utils";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createCustomer(
  data: CustomerFormData
): Promise<ActionResult<Customer>> {
  try {
    const validated = customerSchema.parse(data);

    const cpfCnpj = validated.cpfCnpj.replace(/\D/g, "");
    const phone = validated.phone.replace(/\D/g, "");

    const result = await asaasCreateCustomer({
      name: validated.name,
      cpfCnpj,
      email: validated.email,
      phone: phone.length === 10 ? phone : undefined,
      mobilePhone: phone.length === 11 ? phone : undefined,
      // Desativa notificações automáticas de cobrança (SMS/email) no Asaas
      // https://docs.asaas.com/reference/post_v3-customers#request-body
      notificationDisabled: true,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Erro ao criar cliente",
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Erro ao processar dados do cliente",
    };
  }
}

export interface CreateSubscriptionParams {
  customerId: string;
  amount: number;
  creditCard: CreditCardFormData;
  customerData: CustomerFormData;
}

/**
 * Cria uma assinatura recorrente mensal no Asaas
 * 
 * COMPORTAMENTO DAS COBRANÇAS:
 * 
 * 1. Quando nextDueDate = HOJE:
 *    - O Asaas cria o primeiro pagamento imediatamente
 *    - O pagamento é processado na mesma hora (se cartão válido)
 *    - O próximo pagamento será criado automaticamente 1 mês depois
 * 
 * 2. Quando nextDueDate = DATA FUTURA (ex: próximo mês):
 *    - O Asaas cria o pagamento mas ele fica PENDENTE até a data de vencimento
 *    - O pagamento só será processado na data de vencimento
 *    - O Asaas pode criar automaticamente o próximo pagamento do mês seguinte
 *      quando a subscription é criada (dependendo da configuração da conta)
 * 
 * NOTIFICAÇÕES:
 * - As notificações (email/SMS) são desativadas no cliente ao criar
 * - Após criar a subscription, atualizamos novamente o cliente para garantir
 *   que não há notificações sendo enviadas para as cobranças
 * 
 * VERIFICAÇÃO:
 * - A função busca todos os pagamentos da subscription após criar
 * - Os pagamentos são ordenados por data de vencimento (mais próximo primeiro)
 * - Se nenhum pagamento for encontrado, pode ser normal se nextDueDate for futuro
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<ActionResult<{ subscription: Subscription; firstPayment?: Payment }>> {
  try {
    const { customerId, amount, creditCard, customerData } = params;

    const validatedCard = creditCardSchema.parse(creditCard);
    const cpfCnpj = customerData.cpfCnpj.replace(/\D/g, "");
    const phone = customerData.phone.replace(/\D/g, "");

    // nextDueDate = hoje (primeiro pagamento será processado imediatamente)
    // IMPORTANTE: Quando nextDueDate é hoje, o Asaas cria o pagamento imediatamente
    // Quando nextDueDate é uma data futura (ex: próximo mês), o Asaas cria o pagamento
    // mas ele fica pendente até aquela data. O pagamento só será processado na data de vencimento.
    const nextDueDate = new Date().toISOString().split("T")[0];

    const subscriptionData = {
      customer: customerId,
      billingType: "CREDIT_CARD" as const,
      value: amount,
      nextDueDate,
      cycle: "MONTHLY" as const,
      description: `Assinatura - ${customerData.name}`,
      creditCard: {
        holderName: validatedCard.holderName,
        number: validatedCard.number.replace(/\s/g, ""),
        expiryMonth: validatedCard.expiryMonth,
        expiryYear: validatedCard.expiryYear,
        ccv: validatedCard.ccv,
      },
      creditCardHolderInfo: {
        name: customerData.name,
        email: customerData.email,
        cpfCnpj,
        postalCode: "00000000",
        addressNumber: "0",
        phone: phone || "00000000000",
      },
      remoteIp: getClientIP(),
    };

    const result = await asaasCreateSubscriptionWithCreditCard(subscriptionData);

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || "Erro ao criar assinatura",
      };
    }

    // Garantir que as notificações estão desativadas no cliente
    // Mesmo que já tenham sido desativadas na criação, atualizamos novamente
    // para garantir que não há notificações sendo enviadas para as cobranças da subscription
    await asaasUpdateCustomer(customerId, {
      notificationDisabled: true,
    });

    // Buscar pagamentos da subscription para verificação
    // IMPORTANTE: O Asaas pode criar múltiplos pagamentos:
    // - Se nextDueDate = hoje: cria o primeiro pagamento imediatamente (será processado)
    // - Se nextDueDate = futuro: cria o pagamento mas fica pendente até a data
    // - Para subscriptions mensais: o Asaas pode criar automaticamente o próximo pagamento
    //   do mês seguinte quando a subscription é criada (dependendo da configuração)
    let firstPayment: Payment | undefined;
    let allPayments: Payment[] = [];
    const paymentsResult = await asaasGetSubscriptionPayments(result.data.id);
    if (
      paymentsResult.success &&
      paymentsResult.data?.data &&
      paymentsResult.data.data.length > 0
    ) {
      allPayments = paymentsResult.data.data;
      // Ordenar por data de criação (mais recente primeiro) ou por data de vencimento
      // Pegar o primeiro pagamento (geralmente o que será processado primeiro)
      firstPayment = allPayments.sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB; // Ordenar do mais próximo para o mais distante
      })[0];
    }

    // Verificação: Se não encontrou pagamentos, pode ser que ainda não tenham sido criados
    // Isso pode acontecer se nextDueDate for uma data futura distante
    if (allPayments.length === 0) {
      console.warn(
        `Nenhum pagamento encontrado para a subscription ${result.data.id}. ` +
        `Isso pode ser normal se nextDueDate (${result.data.nextDueDate}) for uma data futura.`
      );
    }

    return {
      success: true,
      data: {
        subscription: result.data,
        firstPayment,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Erro ao processar assinatura",
    };
  }
}

