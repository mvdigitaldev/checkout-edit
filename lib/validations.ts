import { z } from "zod";

function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  let length = cleaned.length - 2;
  let numbers = cleaned.substring(0, length);
  const digits = cleaned.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cleaned.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

function validateCPForCNPJ(value: string): boolean {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 11) return validateCPF(value);
  if (cleaned.length === 14) return validateCNPJ(value);
  return false;
}

function validateCreditCardNumber(value: string): boolean {
  const cleaned = value.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export const customerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpfCnpj: z
    .string()
    .min(11, "CPF/CNPJ inválido")
    .refine(validateCPForCNPJ, "CPF/CNPJ inválido"),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone inválido"),
});

export const creditCardSchema = z.object({
  number: z
    .string()
    .min(13, "Número do cartão inválido")
    .refine(validateCreditCardNumber, "Número do cartão inválido"),
  holderName: z
    .string()
    .min(3, "Nome no cartão deve ter pelo menos 3 caracteres"),
  expiryMonth: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, "Mês inválido")
    .refine((val) => {
      const month = parseInt(val);
      return month >= 1 && month <= 12;
    }, "Mês inválido"),
  expiryYear: z
    .string()
    .regex(/^\d{4}$/, "Ano inválido")
    .refine((val) => {
      const year = parseInt(val);
      const currentYear = new Date().getFullYear();
      return year >= currentYear && year <= currentYear + 10;
    }, "Ano inválido"),
  ccv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
});

export const checkoutSchema = z
  .object({
    customer: customerSchema,
    creditCard: creditCardSchema,
    amount: z.number().positive("Valor deve ser maior que zero"),
  })
  .refine(
    (data) => {
      const month = parseInt(data.creditCard.expiryMonth);
      const year = parseInt(data.creditCard.expiryYear);
      const expiryDate = new Date(year, month - 1);
      const now = new Date();
      return expiryDate > now;
    },
    {
      message: "Cartão expirado",
      path: ["creditCard"],
    }
  );

export type CustomerFormData = z.infer<typeof customerSchema>;
export type CreditCardFormData = z.infer<typeof creditCardSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;

