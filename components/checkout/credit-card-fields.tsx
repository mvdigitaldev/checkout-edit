"use client";

import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCreditCard } from "@/lib/utils";
import { type CheckoutFormData } from "@/lib/validations";

interface CreditCardFieldsProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: any;
}

export function CreditCardFields({ register, errors }: CreditCardFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="creditCard.number" className="text-sm text-muted-foreground">
          Número do Cartão
        </Label>
        <Input
          id="creditCard.number"
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          {...register("creditCard.number", {
            onChange: (e) => {
              e.target.value = formatCreditCard(e.target.value);
            },
          })}
          className={`h-11 ${
            errors.creditCard?.number
              ? "border-destructive focus-visible:ring-destructive"
              : "focus-visible:ring-brand"
          }`}
        />
        {errors.creditCard?.number && (
          <p className="text-sm text-destructive mt-1">
            {errors.creditCard.number.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="creditCard.holderName" className="text-sm text-muted-foreground">
          Nome no Cartão
        </Label>
        <Input
          id="creditCard.holderName"
          placeholder="JOÃO SILVA"
          {...register("creditCard.holderName")}
          className={`h-11 ${
            errors.creditCard?.holderName
              ? "border-destructive focus-visible:ring-destructive"
              : "focus-visible:ring-brand"
          }`}
        />
        {errors.creditCard?.holderName && (
          <p className="text-sm text-destructive mt-1">
            {errors.creditCard.holderName.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="creditCard.expiryMonth" className="text-sm text-muted-foreground">
            Validade
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id="creditCard.expiryMonth"
              placeholder="MM"
              maxLength={2}
              {...register("creditCard.expiryMonth")}
              className={`h-11 ${
                errors.creditCard?.expiryMonth
                  ? "border-destructive focus-visible:ring-destructive"
                  : "focus-visible:ring-brand"
              }`}
            />
            <span className="text-muted-foreground">/</span>
            <Input
              id="creditCard.expiryYear"
              placeholder="AAAA"
              maxLength={4}
              {...register("creditCard.expiryYear")}
              className={`h-11 ${
                errors.creditCard?.expiryYear
                  ? "border-destructive focus-visible:ring-destructive"
                  : "focus-visible:ring-brand"
              }`}
            />
          </div>
          {(errors.creditCard?.expiryMonth ||
            errors.creditCard?.expiryYear) && (
            <p className="text-sm text-destructive mt-1">
              {errors.creditCard.expiryMonth?.message ||
                errors.creditCard.expiryYear?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="creditCard.ccv" className="text-sm text-muted-foreground">
            CVV
          </Label>
          <Input
            id="creditCard.ccv"
            placeholder="123"
            type="password"
            maxLength={4}
            {...register("creditCard.ccv")}
            className={`h-11 ${
              errors.creditCard?.ccv
                ? "border-destructive focus-visible:ring-destructive"
                : "focus-visible:ring-brand"
            }`}
          />
          {errors.creditCard?.ccv && (
            <p className="text-sm text-destructive mt-1">
              {errors.creditCard.ccv.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

