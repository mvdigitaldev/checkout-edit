"use server";

import {
  createCustomer as asaasCreateCustomer,
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

export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<ActionResult<{ subscription: Subscription; firstPayment?: Payment }>> {
  try {
    const { customerId, amount, creditCard, customerData } = params;

    const validatedCard = creditCardSchema.parse(creditCard);
    const cpfCnpj = customerData.cpfCnpj.replace(/\D/g, "");
    const phone = customerData.phone.replace(/\D/g, "");

    // nextDueDate = hoje (primeiro pagamento será processado imediatamente)
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

    // Buscar primeiro pagamento da subscription
    let firstPayment: Payment | undefined;
    const paymentsResult = await asaasGetSubscriptionPayments(result.data.id);
    if (
      paymentsResult.success &&
      paymentsResult.data?.data &&
      paymentsResult.data.data.length > 0
    ) {
      // Pegar o primeiro pagamento da lista (primeiro processado quando subscription é criada)
      firstPayment = paymentsResult.data.data[0];
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

