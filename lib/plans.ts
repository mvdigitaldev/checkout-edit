interface Plan {
  uuid: string;
  value: number;
}

/**
 * Busca um plano pelo UUID
 * @param uuid UUID do plano
 * @returns Plan com uuid e value, ou null se não encontrado
 */
export function getPlanByUuid(uuid: string): Plan | null {
  if (!uuid || typeof uuid !== "string") {
    return null;
  }

  // Buscar planos do .env.local
  const plan1Uuid = process.env.PLAN_1_UUID;
  const plan1Value = process.env.PLAN_1_VALUE;
  const plan2Uuid = process.env.PLAN_2_UUID;
  const plan2Value = process.env.PLAN_2_VALUE;

  // Normalizar UUID (remover espaços, converter para minúsculas)
  const normalizedUuid = uuid.trim().toLowerCase();

  // Verificar Plano 1
  if (plan1Uuid && plan1Value) {
    if (plan1Uuid.trim().toLowerCase() === normalizedUuid) {
      const value = parseFloat(plan1Value);
      if (!isNaN(value) && value > 0) {
        return { uuid: plan1Uuid, value };
      }
    }
  }

  // Verificar Plano 2
  if (plan2Uuid && plan2Value) {
    if (plan2Uuid.trim().toLowerCase() === normalizedUuid) {
      const value = parseFloat(plan2Value);
      if (!isNaN(value) && value > 0) {
        return { uuid: plan2Uuid, value };
      }
    }
  }

  return null;
}

/**
 * Retorna todos os planos disponíveis
 * @returns Array com todos os planos configurados
 */
export function getAllPlans(): Plan[] {
  const plans: Plan[] = [];

  const plan1Uuid = process.env.PLAN_1_UUID;
  const plan1Value = process.env.PLAN_1_VALUE;
  const plan2Uuid = process.env.PLAN_2_UUID;
  const plan2Value = process.env.PLAN_2_VALUE;

  if (plan1Uuid && plan1Value) {
    const value = parseFloat(plan1Value);
    if (!isNaN(value) && value > 0) {
      plans.push({ uuid: plan1Uuid, value });
    }
  }

  if (plan2Uuid && plan2Value) {
    const value = parseFloat(plan2Value);
    if (!isNaN(value) && value > 0) {
      plans.push({ uuid: plan2Uuid, value });
    }
  }

  return plans;
}

