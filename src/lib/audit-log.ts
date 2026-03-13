import { prisma } from "@/lib/prisma";

type AuditParams = {
  entityType: "order" | "product";
  entityId: string;
  action: "create" | "update" | "delete";
  field?: string;
  oldValue?: string;
  newValue?: string;
};

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        field: params.field,
        oldValue: params.oldValue ?? null,
        newValue: params.newValue ?? null,
      },
    });
  } catch (err) {
    console.error("[audit-log]", err);
  }
}
