const ASAAS_API_URL =
  process.env.ASAAS_API_URL || "https://api.asaas.com/v3";

function getAsaasApiKey(): string {
  // Tentar ler a variável de ambiente
  let key = process.env.ASAAS_API_KEY?.trim();
  
  // O Next.js/dotenv processa o escape \ e retorna a chave com $
  // Mas se ainda tiver o escape literal, remover
  if (key && key.startsWith("\\$")) {
    key = key.substring(1); // Remove o \ deixando apenas o $
  }
  
  // Se a chave existe mas não começa com $, pode ter sido expandida incorretamente
  if (key && key.length > 0 && !key.startsWith("$aact_")) {
    // Se começa com "aact_", o $ foi removido pela expansão
    if (key.startsWith("aact_")) {
      key = "$" + key;
    }
  }
  
  // Se ainda não encontrou ou está vazio, lançar erro
  if (!key || key.length === 0) {
    throw new Error(
      "ASAAS_API_KEY não configurada ou não pôde ser lida. " +
      "Verifique se no arquivo .env.local está usando: ASAAS_API_KEY=\\$aact_prod_... " +
      "E se o servidor foi reiniciado após alterar o arquivo (delete a pasta .next e reinicie)."
    );
  }
  
  // Validar formato da chave (deve começar com $aact_)
  if (!key.startsWith("$aact_")) {
    throw new Error(
      "Formato de chave API inválido. " +
      "A chave deve começar com $aact_prod_ (produção) ou $aact_hmlg_ (sandbox). " +
      `Chave recebida (primeiros 30 caracteres): ${key.substring(0, 30)}`
    );
  }
  
  return key;
}

interface AsaasError {
  errors: Array<{
    code: string;
    description: string;
  }>;
}

interface AsaasResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function asaasRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<AsaasResponse<T>> {
  try {
    const apiKey = getAsaasApiKey();
    const requestOptions: RequestInit = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        access_token: apiKey,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${ASAAS_API_URL}${endpoint}`, requestOptions);

    const data = await response.json();

    if (!response.ok) {
      const error = data as AsaasError;
      const errorMessage =
        error.errors?.[0]?.description || "Erro ao processar requisição";
      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao conectar com o servidor",
    };
  }
}

export interface Customer {
  object: string;
  id: string;
  dateCreated: string;
  name: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj: string;
  personType: "FISICA" | "JURIDICA";
}

export interface CreateCustomerData {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  /**
   * true to disable sending billing notifications (email/SMS) for this customer
   * https://docs.asaas.com/reference/post_v3-customers
   */
  notificationDisabled?: boolean;
}

export async function createCustomer(
  data: CreateCustomerData
): Promise<AsaasResponse<Customer>> {
  return asaasRequest<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface UpdateCustomerData {
  name?: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  /**
   * true to disable sending billing notifications (email/SMS) for this customer
   * https://docs.asaas.com/reference/put_v3-customers-id
   */
  notificationDisabled?: boolean;
}

export async function updateCustomer(
  customerId: string,
  data: UpdateCustomerData
): Promise<AsaasResponse<Customer>> {
  return asaasRequest<Customer>(`/customers/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export interface Payment {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
  status: string;
  dueDate: string;
  description?: string;
  pixTransaction?: string;
  pixQrCodeId?: string;
}

export interface CreatePaymentData {
  customer: string;
  billingType: "PIX" | "CREDIT_CARD";
  value: number;
  dueDate: string;
  description?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
  remoteIp?: string;
}

export async function createPayment(
  data: CreatePaymentData
): Promise<AsaasResponse<Payment>> {
  const endpoint =
    data.billingType === "CREDIT_CARD" ? "/payments/" : "/payments";

  return asaasRequest<Payment>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface Subscription {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  billingType: "CREDIT_CARD";
  cycle: "MONTHLY";
  value: number;
  nextDueDate: string;
  status: "ACTIVE" | "EXPIRED" | "INACTIVE";
  description?: string;
  creditCard?: {
    creditCardNumber: string;
    creditCardBrand: string;
    creditCardToken?: string;
  };
}

export interface CreateSubscriptionWithCreditCardData {
  customer: string;
  billingType: "CREDIT_CARD";
  value: number;
  nextDueDate: string; // YYYY-MM-DD
  cycle: "MONTHLY";
  description?: string;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string; // "01" a "12"
    expiryYear: string; // "2025"
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
    mobilePhone?: string;
  };
  remoteIp: string;
}

export async function createSubscriptionWithCreditCard(
  data: CreateSubscriptionWithCreditCardData
): Promise<AsaasResponse<Subscription>> {
  return asaasRequest<Subscription>("/subscriptions/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface SubscriptionPaymentsResponse {
  object: string;
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: Payment[];
}

export async function getSubscriptionPayments(
  subscriptionId: string
): Promise<AsaasResponse<SubscriptionPaymentsResponse>> {
  return asaasRequest<SubscriptionPaymentsResponse>(
    `/subscriptions/${subscriptionId}/payments`,
    {
      method: "GET",
    }
  );
}

export interface PixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
  description?: string;
}

export async function getPixQrCode(
  paymentId: string
): Promise<AsaasResponse<PixQrCode>> {
  return asaasRequest<PixQrCode>(`/payments/${paymentId}/pixQrCode`, {
    method: "GET",
  });
}

