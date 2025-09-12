/**
 * EntityLink Validator - Bulletproof validation for entity linking operations
 * 
 * This service provides comprehensive validation for entity links including:
 * - Business rule validation
 * - Circular dependency detection
 * - Entity existence verification
 * - Permission validation
 * - Tenant isolation
 */

import {
  EntityRef,
  LinkKind,
  ValidationResult,
  ValidationError,
  EntityLinkError,
  EntityLinkErrorCode,
  LINK_RULES,
  isValidEntityType,
  isValidLinkKind,
  canLink,
} from '../types/entity-link.types';

export class EntityLinkValidator {
  /**
   * Validate a link creation request
   */
  static async validateLink(
    from: EntityRef,
    to: EntityRef,
    kind: LinkKind,
    options: {
      skipEntityExistence?: boolean;
      skipCircularCheck?: boolean;
      skipPermissionCheck?: boolean;
    } = {}
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    try {
      // 1. Basic validation
      const basicValidation = this.validateBasicRequirements(from, to, kind);
      if (!basicValidation.valid) {
        errors.push(...basicValidation.errors);
      }

      // 2. Business rule validation
      const ruleValidation = this.validateBusinessRules(from, to, kind);
      if (!ruleValidation.valid) {
        errors.push(...ruleValidation.errors);
      }

      // 3. Tenant isolation validation
      const tenantValidation = this.validateTenantIsolation(from, to);
      if (!tenantValidation.valid) {
        errors.push(...tenantValidation.errors);
      }

      // 4. Self-linking prevention
      const selfLinkValidation = this.validateNoSelfLink(from, to);
      if (!selfLinkValidation.valid) {
        errors.push(...selfLinkValidation.errors);
      }

      // 5. Entity existence validation (async)
      if (!options.skipEntityExistence) {
        const existenceValidation = await this.validateEntityExistence(from, to);
        if (!existenceValidation.valid) {
          errors.push(...existenceValidation.errors);
        }
      }

      // 6. Circular dependency detection (async)
      if (!options.skipCircularCheck && this.isDependencyLink(kind)) {
        const circularValidation = await this.validateNoCircularDependency(from, to, kind);
        if (!circularValidation.valid) {
          errors.push(...circularValidation.errors);
        }
      }

      // 7. Permission validation (async)
      if (!options.skipPermissionCheck) {
        const permissionValidation = await this.validatePermissions(from, to, kind);
        if (!permissionValidation.valid) {
          errors.push(...permissionValidation.errors);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            code: EntityLinkErrorCode.VALIDATION_FAILED,
            message: 'Validation failed due to unexpected error',
            details: { error: error instanceof Error ? error.message : error },
          },
        ],
      };
    }
  }

  /**
   * Validate basic requirements (types, format, etc.)
   */
  private static validateBasicRequirements(
    from: EntityRef,
    to: EntityRef,
    kind: LinkKind
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate entity references
    if (!from || typeof from !== 'object') {
      errors.push({
        code: EntityLinkErrorCode.INVALID_ENTITY_TYPE,
        message: 'Source entity reference is required',
        field: 'from',
      });
    } else {
      if (!from.type || !isValidEntityType(from.type)) {
        errors.push({
          code: EntityLinkErrorCode.INVALID_ENTITY_TYPE,
          message: `Invalid source entity type: ${from.type}`,
          field: 'from.type',
        });
      }
      if (!from.id || typeof from.id !== 'string') {
        errors.push({
          code: EntityLinkErrorCode.INVALID_ENTITY_TYPE,
          message: 'Source entity ID is required',
          field: 'from.id',
        });
      }
      if (!from.tenantId || typeof from.tenantId !== 'string') {
        errors.push({
          code: EntityLinkErrorCode.TENANT_MISMATCH,
          message: 'Source entity tenant ID is required',
          field: 'from.tenantId',
        });
      }
    }

    if (!to || typeof to !== 'object') {
      errors.push({
        code: EntityLinkErrorCode.INVALID_ENTITY_TYPE,
        message: 'Target entity reference is required',
        field: 'to',
      });
    } else {
      if (!to.type || !isValidEntityType(to.type)) {
        errors.push({
          code: EntityLinkErrorCode.INVALID_ENTITY_TYPE,
          message: `Invalid target entity type: ${to.type}`,
          field: 'to.type',
        });
      }
      if (!to.id || typeof to.id !== 'string') {
        errors.push({
          code: EntityLinkErrorCode.INVALID_ENTITY_TYPE,
          message: 'Target entity ID is required',
          field: 'to.id',
        });
      }
      if (!to.tenantId || typeof to.tenantId !== 'string') {
        errors.push({
          code: EntityLinkErrorCode.TENANT_MISMATCH,
          message: 'Target entity tenant ID is required',
          field: 'to.tenantId',
        });
      }
    }

    // Validate link kind
    if (!kind || !isValidLinkKind(kind)) {
      errors.push({
        code: EntityLinkErrorCode.INVALID_LINK_KIND,
        message: `Invalid link kind: ${kind}`,
        field: 'kind',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate business rules for linking
   */
  private static validateBusinessRules(
    from: EntityRef,
    to: EntityRef,
    kind: LinkKind
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Check if the link kind is allowed for the entity types
    if (!canLink(from.type, to.type, kind)) {
      errors.push({
        code: EntityLinkErrorCode.INVALID_LINK_KIND,
        message: `Cannot create '${kind}' link from ${from.type} to ${to.type}`,
        field: 'kind',
        details: {
          fromType: from.type,
          toType: to.type,
          kind,
          allowedTargets: LINK_RULES[from.type]?.[kind as keyof typeof LINK_RULES[EntityRef['type']]] || [],
        },
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate tenant isolation
   */
  private static validateTenantIsolation(
    from: EntityRef,
    to: EntityRef
  ): ValidationResult {
    const errors: ValidationError[] = [];

    if (from.tenantId !== to.tenantId) {
      errors.push({
        code: EntityLinkErrorCode.TENANT_MISMATCH,
        message: 'Cannot create links between entities from different tenants',
        details: {
          fromTenantId: from.tenantId,
          toTenantId: to.tenantId,
        },
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate that entity isn't linking to itself
   */
  private static validateNoSelfLink(
    from: EntityRef,
    to: EntityRef
  ): ValidationResult {
    const errors: ValidationError[] = [];

    if (from.type === to.type && from.id === to.id) {
      errors.push({
        code: EntityLinkErrorCode.VALIDATION_FAILED,
        message: 'Cannot create link from entity to itself',
        details: {
          entityType: from.type,
          entityId: from.id,
        },
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate that entities exist (mock implementation)
   */
  private static async validateEntityExistence(
    from: EntityRef,
    to: EntityRef
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    try {
      // TODO: Implement actual entity existence checks
      // This would query the appropriate repositories to verify entities exist
      
      const fromExists = await this.checkEntityExists(from);
      const toExists = await this.checkEntityExists(to);

      if (!fromExists) {
        errors.push({
          code: EntityLinkErrorCode.ENTITY_NOT_FOUND,
          message: `Source entity not found: ${from.type}:${from.id}`,
          field: 'from',
          details: from,
        });
      }

      if (!toExists) {
        errors.push({
          code: EntityLinkErrorCode.ENTITY_NOT_FOUND,
          message: `Target entity not found: ${to.type}:${to.id}`,
          field: 'to',
          details: to,
        });
      }
    } catch (error) {
      errors.push({
        code: EntityLinkErrorCode.VALIDATION_FAILED,
        message: 'Failed to validate entity existence',
        details: { error: error instanceof Error ? error.message : error },
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate no circular dependencies
   */
  private static async validateNoCircularDependency(
    from: EntityRef,
    to: EntityRef,
    kind: LinkKind
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    try {
      // Check for circular dependency using graph traversal
      const hasCircularDependency = await this.detectCircularDependency(from, to, kind);

      if (hasCircularDependency) {
        errors.push({
          code: EntityLinkErrorCode.CIRCULAR_DEPENDENCY,
          message: `Creating this link would create a circular dependency`,
          details: {
            from,
            to,
            kind,
          },
        });
      }
    } catch (error) {
      errors.push({
        code: EntityLinkErrorCode.VALIDATION_FAILED,
        message: 'Failed to validate circular dependency',
        details: { error: error instanceof Error ? error.message : error },
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate user permissions
   */
  private static async validatePermissions(
    from: EntityRef,
    to: EntityRef,
    kind: LinkKind
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    try {
      // TODO: Implement actual permission checks
      // This would check if the current user has permission to link these entities
      
      const hasPermission = await this.checkLinkPermission(from, to, kind);

      if (!hasPermission) {
        errors.push({
          code: EntityLinkErrorCode.PERMISSION_DENIED,
          message: 'Insufficient permissions to create this link',
          details: {
            from,
            to,
            kind,
          },
        });
      }
    } catch (error) {
      errors.push({
        code: EntityLinkErrorCode.VALIDATION_FAILED,
        message: 'Failed to validate permissions',
        details: { error: error instanceof Error ? error.message : error },
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if a link kind creates dependencies
   */
  private static isDependencyLink(kind: LinkKind): boolean {
    return [
      'depends_on',
      'blocks',
      'parent_of',
      'child_of',
    ].includes(kind);
  }

  /**
   * Mock implementation for entity existence check
   * TODO: Replace with actual repository calls
   */
  private static async checkEntityExists(entity: EntityRef): Promise<boolean> {
    // Mock implementation - always returns true for now
    // In real implementation, this would query the appropriate repository
    return true;
  }

  /**
   * Mock implementation for circular dependency detection
   * TODO: Replace with actual graph traversal implementation
   */
  private static async detectCircularDependency(
    from: EntityRef,
    to: EntityRef,
    kind: LinkKind
  ): Promise<boolean> {
    // Mock implementation - always returns false for now
    // In real implementation, this would perform graph traversal to detect cycles
    return false;
  }

  /**
   * Mock implementation for permission checking
   * TODO: Replace with actual permission system
   */
  private static async checkLinkPermission(
    from: EntityRef,
    to: EntityRef,
    kind: LinkKind
  ): Promise<boolean> {
    // Mock implementation - always returns true for now
    // In real implementation, this would check user permissions
    return true;
  }

  /**
   * Validate multiple links at once (for bulk operations)
   */
  static async validateBulkLinks(
    links: Array<{ from: EntityRef; to: EntityRef; kind: LinkKind }>,
    options: {
      stopOnFirstError?: boolean;
      skipEntityExistence?: boolean;
      skipCircularCheck?: boolean;
      skipPermissionCheck?: boolean;
    } = {}
  ): Promise<{ valid: boolean; results: ValidationResult[] }> {
    const results: ValidationResult[] = [];
    let allValid = true;

    for (const link of links) {
      const result = await this.validateLink(link.from, link.to, link.kind, options);
      results.push(result);

      if (!result.valid) {
        allValid = false;
        if (options.stopOnFirstError) {
          break;
        }
      }
    }

    return {
      valid: allValid,
      results,
    };
  }
}