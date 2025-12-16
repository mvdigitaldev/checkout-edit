"use client";

import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCPF, formatPhone } from "@/lib/utils";
import { type CheckoutFormData } from "@/lib/validations";

interface CustomerFieldsProps {
  register: UseFormRegister<CheckoutFormData>;
  setValue: UseFormSetValue<CheckoutFormData>;
  errors: any;
}

export function CustomerFields({ register, setValue, errors }: CustomerFieldsProps) {
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setValue("customer.cpfCnpj", formatted, { shouldValidate: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue("customer.phone", formatted, { shouldValidate: true });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="customer.name" className="text-sm text-muted-foreground">
          Nome Completo
        </Label>
        <Input
          id="customer.name"
          placeholder="João Silva"
          {...register("customer.name")}
          className={`h-11 ${
            errors.customer?.name
              ? "border-destructive focus-visible:ring-destructive"
              : "focus-visible:ring-brand"
          }`}
        />
        {errors.customer?.name && (
          <p className="text-sm text-destructive mt-1">{errors.customer.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer.cpfCnpj" className="text-sm text-muted-foreground">
          CPF/CNPJ
        </Label>
        <Input
          id="customer.cpfCnpj"
          placeholder="000.000.000-00"
          maxLength={18}
          {...register("customer.cpfCnpj")}
          onChange={handleCPFChange}
          className={`h-11 ${
            errors.customer?.cpfCnpj
              ? "border-destructive focus-visible:ring-destructive"
              : "focus-visible:ring-brand"
          }`}
        />
        {errors.customer?.cpfCnpj && (
          <p className="text-sm text-destructive mt-1">{errors.customer.cpfCnpj.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer.email" className="text-sm text-muted-foreground">
          Email
        </Label>
        <Input
          id="customer.email"
          type="email"
          placeholder="joao@example.com"
          {...register("customer.email")}
          className={`h-11 ${
            errors.customer?.email
              ? "border-destructive focus-visible:ring-destructive"
              : "focus-visible:ring-brand"
          }`}
        />
        {errors.customer?.email && (
          <p className="text-sm text-destructive mt-1">{errors.customer.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer.phone" className="text-sm text-muted-foreground">
          Telefone
        </Label>
        <Input
          id="customer.phone"
          placeholder="(00) 00000-0000"
          maxLength={15}
          {...register("customer.phone")}
          onChange={handlePhoneChange}
          className={`h-11 ${
            errors.customer?.phone
              ? "border-destructive focus-visible:ring-destructive"
              : "focus-visible:ring-brand"
          }`}
        />
        {errors.customer?.phone && (
          <p className="text-sm text-destructive mt-1">{errors.customer.phone.message}</p>
        )}
      </div>
    </div>
  );
}

