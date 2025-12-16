"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations";
import { createCustomer, createSubscription } from "@/app/actions/checkout";
import { CustomerFields } from "./customer-fields";
import { CreditCardFields } from "./credit-card-fields";
import { PaymentSuccess } from "./payment-success";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CreditCard, ArrowLeft } from "lucide-react";
import { EditaiLogo } from "@/components/ui/editai-logo";
import Link from "next/link";

interface CheckoutFormProps {
  amount: number;
}

type SubscriptionResult = {
  subscriptionId: string;
  value: number;
  nextDueDate: string;
  paymentId?: string;
  status?: string;
};

export function CheckoutForm({ amount }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionResult, setSubscriptionResult] = useState<SubscriptionResult | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      amount,
      customer: {
        name: "",
        cpfCnpj: "",
        email: "",
        phone: "",
      },
      creditCard: {
        number: "",
        holderName: "",
        expiryMonth: "",
        expiryYear: "",
        ccv: "",
      },
    },
  });

  const onError = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.customer) {
      const customerError = Object.values(firstError.customer)[0] as any;
      toast({
        title: "Erro de validação",
        description: customerError?.message || "Por favor, verifique os campos do formulário",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erro de validação",
        description: firstError?.message || "Por favor, verifique os campos do formulário",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true);
    setSubscriptionResult(null);

    try {
      const customerResult = await createCustomer(data.customer);

      if (!customerResult.success || !customerResult.data) {
        toast({
          title: "Erro ao criar cliente",
          description: customerResult.error || "Tente novamente",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const subscriptionResult = await createSubscription({
        customerId: customerResult.data.id,
        amount: data.amount,
        creditCard: data.creditCard,
        customerData: data.customer,
      });

      if (!subscriptionResult.success || !subscriptionResult.data) {
        toast({
          title: "Erro ao criar assinatura",
          description: subscriptionResult.error || "Tente novamente",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { subscription, firstPayment } = subscriptionResult.data;

      setSubscriptionResult({
        subscriptionId: subscription.id,
        value: subscription.value,
        nextDueDate: subscription.nextDueDate,
        paymentId: firstPayment?.id,
        status: firstPayment?.status,
      });

      toast({
        title: "Assinatura criada com sucesso!",
        description: "Sua assinatura foi criada e o primeiro pagamento foi processado",
      });
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (subscriptionResult) {
    return (
      <PaymentSuccess
        subscriptionId={subscriptionResult.subscriptionId}
        value={subscriptionResult.value}
        nextDueDate={subscriptionResult.nextDueDate}
        paymentId={subscriptionResult.paymentId}
        status={subscriptionResult.status}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary - Coluna Esquerda */}
          <div className="order-2 lg:order-1">
            <Card className="sticky top-8 shadow-sm" style={{ backgroundColor: 'rgba(43, 156, 252, 0.05)', borderColor: 'rgba(43, 156, 252, 1)', color: 'rgba(0, 110, 255, 1)' }}>
              <CardContent className="p-6 rounded-[76px]">
                {/* Botão de voltar, logo e nome Editai dentro do card */}
                <div className="flex items-center gap-2 mb-2">
                  <Link 
                    href="https://lp.editai.online" 
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Voltar para página inicial"
                  >
                    <ArrowLeft className="h-5 w-5 text-foreground" />
                  </Link>
                  <EditaiLogo size="md" />
                </div>
                <h2 className="text-lg font-semibold mb-6 text-brand">Resumo</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <EditaiLogo size="sm" showText={false} />
                        <p className="font-semibold text-foreground">
                          <span className="text-brand">Editai</span>, assinatura mensal
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Editai - Seu editor na palma da sua mão.
                      </p>
                    </div>
                    <p className="text-lg font-bold text-brand">{formatCurrency(amount)}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="text-xl font-bold text-brand">{formatCurrency(amount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário - Coluna Direita */}
          <div className="order-1 lg:order-2">
            <Card className="shadow-sm">
              <CardContent className="p-6 lg:p-8 rounded-[76px]">
                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
                  {/* Contact details */}
                  <div className="space-y-5">
                    <h3 className="text-base font-semibold text-foreground">
                      Dados de Contato
                    </h3>
                    <CustomerFields register={register} setValue={setValue} errors={errors} />
                  </div>

                  {/* Payment details */}
                  <div className="space-y-5 border-t pt-8">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-brand" />
                      <h3 className="text-base font-semibold text-foreground">
                        Dados de Pagamento
                      </h3>
                    </div>
                    <CreditCardFields register={register} errors={errors} />
                  </div>

                  {/* Botão Principal */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Criando Assinatura...
                        </>
                      ) : (
                        "Finalizar Assinatura"
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Seus dados estão protegidos e criptografados
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

