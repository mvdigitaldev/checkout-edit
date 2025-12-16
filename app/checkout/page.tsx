import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { getPlanByUuid } from "@/lib/plans";

interface CheckoutPageProps {
  searchParams: Promise<{ plan?: string; amount?: string }>;
}

function CheckoutContent({ amount }: { amount: number }) {
  return <CheckoutForm amount={amount} />;
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const params = await searchParams;
  let amount = 0;

  // Prioridade: plan > amount
  if (params.plan) {
    const plan = getPlanByUuid(params.plan);
    if (plan) {
      amount = plan.value;
    } else {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Plano não encontrado</h1>
            <p className="text-muted-foreground">
              O plano informado não existe. Verifique o código do plano na URL.
            </p>
          </div>
        </div>
      );
    }
  } else if (params.amount) {
    amount = parseFloat(params.amount);
  } else {
    // Fallback: usar primeiro plano disponível ou erro
    const { getAllPlans } = await import("@/lib/plans");
    const allPlans = getAllPlans();
    if (allPlans.length > 0) {
      amount = allPlans[0].value;
    } else {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Nenhum plano configurado</h1>
            <p className="text-muted-foreground">
              Por favor, configure os planos no arquivo .env.local ou informe um plano válido na URL: /checkout?plan=uuid
            </p>
          </div>
        </div>
      );
    }
  }

  if (isNaN(amount) || amount <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Valor inválido</h1>
          <p className="text-muted-foreground">
            Por favor, forneça um plano válido na URL: /checkout?plan=uuid
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <CheckoutContent amount={amount} />
      </Suspense>
      <Toaster />
    </>
  );
}

