/**
 * EntityLink Service Tests - Integration testing for the service layer
 * 
 * Tests cover:
 * - CRUD operations with proper error handling
 * - Caching functionality and invalidation  
 * - Bulk operations and transaction behavior
 * - Graph traversal and path finding
 * - Validation integration
 * - Multi-tenancy isolation
 * - Error scenarios and edge cases
 */

import { EntityLinkServiceImpl } from './entity-link.service';
import { MockEntityLinkRepository } from '../repositories/entity-link.repository';
import { EntityLinkValidator } from './entity-link.validator';
import {
  EntityRef,
  EntityLink,
  EntityLinkWithDetails,
  LinkKind,
  EntityLinkError,
  EntityLinkErrorCode,
  createEntityRef,
} from '../types/entity-link.types';

// Mock the validator
jest.mock('./entity-link.validator');
const MockedValidator = EntityLinkValidator as jest.Mocked<typeof EntityLinkValidator>;

// Mock the repository
jest.mock('../repositories/entity-link.repository', () => ({
  MockEntityLinkRepository: jest.fn(),
  entityLinkRepository: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByEntity: jest.fn(),
    findByCriteria: jest.fn(),
    linkExists: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

describe('EntityLinkServiceImpl', () => {
  let service: EntityLinkServiceImpl;
  let mockRepository: jest.Mocked<any>;
  
  const validTenantId = 'tenant_123';
  const validTaskEntity: EntityRef = createEntityRef('task', 'task_1', validTenantId);
  const validProjectEntity: EntityRef = createEntityRef('project', 'project_1', validTenantId);
  const validUserEntity: EntityRef = createEntityRef('user', 'user_1', validTenantId);

  const sampleLink: EntityLink = {
    id: 'link_123',
    tenantId: validTenantId,
    fromType: 'task',
    fromId: 'task_1',
    toType: 'project',
    toId: 'project_1',
    kind: 'depends_on',
    note: 'Test link',
    metadata: null,
    active: true,
    createdBy: 'user_123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const sampleLinkWithDetails: EntityLinkWithDetails = {
    ...sampleLink,
    fromEntity: {
      id: 'task_1',
      title: 'Test Task',
      type: 'task',
      status: 'active',
    },
    toEntity: {
      id: 'project_1',
      title: 'Test Project',
      type: 'project',
      status: 'active',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    service = new EntityLinkServiceImpl();
    
    // Get mock repository reference
    const { entityLinkRepository } = require('../repositories/entity-link.repository');
    mockRepository = entityLinkRepository;

    // Setup default validator behavior
    MockedValidator.validateLink.mockResolvedValue({
      valid: true,
      errors: [],
    });

    MockedValidator.validateBulkLinks.mockResolvedValue({
      valid: true,
      results: [],
    });
  });

  describe('createLink', () => {
    it('should create a link successfully', async () => {
      mockRepository.linkExists.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(sampleLink);

      const result = await service.createLink(
        validTaskEntity,
        validProjectEntity,
        'depends_on',
        {
          note: 'Test link',
          userId: 'user_123',
          allowDuplicates: false,
        }
      );

      expect(result).toEqual(sampleLink);
      expect(MockedValidator.validateLink).toHaveBeenCalledWith(
        validTaskEntity,
        validProjectEntity,
        'depends_on',
        expect.any(Object)
      );
      expect(mockRepository.linkExists).toHaveBeenCalledWith(
        validTaskEntity,
        validProjectEntity,
        'depends_on'
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        tenantId: validTenantId,
        fromType: 'task',
        fromId: 'task_1',
        toType: 'project',
        toId: 'project_1',
        kind: 'depends_on',
        note: 'Test link',
        metadata: undefined,
        active: true,
        createdBy: 'user_123',
      });
    });

    it('should reject link creation when validation fails', async () => {
      MockedValidator.validateLink.mockResolvedValue({
        valid: false,
        errors: [
          {
            code: EntityLinkErrorCode.INVALID_LINK_KIND,
            message: 'Invalid link kind',
          },
        ],
      });

      await expect(
        service.createLink(validTaskEntity, validProjectEntity, 'invalid_kind' as any)
      ).rejects.toThrow(EntityLinkError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should reject duplicate links when not allowed', async () => {
      mockRepository.linkExists.mockResolvedValue(sampleLink);

      await expect(
        service.createLink(
          validTaskEntity,
          validProjectEntity,
          'depends_on',
          { allowDuplicates: false }
        )
      ).rejects.toThrow(EntityLinkError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should allow duplicate links when explicitly permitted', async () => {
      mockRepository.linkExists.mockResolvedValue(sampleLink);
      mockRepository.create.mockResolvedValue({ ...sampleLink, id: 'link_124' });

      const result = await service.createLink(
        validTaskEntity,
        validProjectEntity,
        'depends_on',
        { allowDuplicates: true }
      );

      expect(result.id).toBe('link_124');
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      mockRepository.linkExists.mockResolvedValue(null);
      mockRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createLink(validTaskEntity, validProjectEntity, 'depends_on')
      ).rejects.toThrow(EntityLinkError);
    });
  });

  describe('updateLink', () => {
    it('should update a link successfully', async () => {
      const updatedLink = { ...sampleLink, note: 'Updated note' };
      mockRepository.findById.mockResolvedValue(sampleLink);
      mockRepository.update.mockResolvedValue(updatedLink);

      const result = await service.updateLink(
        'link_123',
        { note: 'Updated note' },
        validTenantId
      );

      expect(result).toEqual(updatedLink);
      expect(mockRepository.findById).toHaveBeenCalledWith('link_123', validTenantId);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'link_123',
        { note: 'Updated note' },
        validTenantId
      );
    });

    it('should validate link kind changes', async () => {
      mockRepository.findById.mockResolvedValue(sampleLink);
      MockedValidator.validateLink.mockResolvedValue({
        valid: false,
        errors: [{ code: EntityLinkErrorCode.INVALID_LINK_KIND, message: 'Invalid' }],
      });

      await expect(
        service.updateLink('link_123', { kind: 'invalid_kind' as any }, validTenantId)
      ).rejects.toThrow(EntityLinkError);

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should reject updates to non-existent links', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateLink('nonexistent_link', { note: 'test' }, validTenantId)
      ).rejects.toThrow(EntityLinkError);

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteLink', () => {
    it('should soft delete a link by default', async () => {
      mockRepository.findById.mockResolvedValue(sampleLink);
      mockRepository.update.mockResolvedValue({ ...sampleLink, active: false });

      await service.deleteLink('link_123', validTenantId);

      expect(mockRepository.findById).toHaveBeenCalledWith('link_123', validTenantId);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'link_123',
        { active: false },
        validTenantId
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should hard delete when explicitly requested', async () => {
      mockRepository.findById.mockResolvedValue(sampleLink);

      await service.deleteLink('link_123', validTenantId, false);

      expect(mockRepository.delete).toHaveBeenCalledWith('link_123', validTenantId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should reject deleting non-existent links', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.deleteLink('nonexistent_link', validTenantId)
      ).rejects.toThrow(EntityLinkError);

      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getLink', () => {
    it('should return cached link when available', async () => {
      // First call - should hit repository
      mockRepository.findById.mockResolvedValue(sampleLink);
      
      const result1 = await service.getLink('link_123', validTenantId);
      expect(result1).toEqual(sampleLink);
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await service.getLink('link_123', validTenantId);
      expect(result2).toEqual(sampleLink);
      expect(mockRepository.findById).toHaveBeenCalledTimes(1); // No additional calls
    });

    it('should return null for non-existent links', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getLink('nonexistent_link', validTenantId);

      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(
        service.getLink('link_123', validTenantId)
      ).rejects.toThrow(EntityLinkError);
    });
  });

  describe('getEntityLinks', () => {
    it('should return links for an entity', async () => {
      const links = [sampleLinkWithDetails];
      mockRepository.findByEntity.mockResolvedValue(links);

      const result = await service.getEntityLinks(validTaskEntity);

      expect(result).toEqual(links);
      expect(mockRepository.findByEntity).toHaveBeenCalledWith(
        validTaskEntity,
        expect.any(Object)
      );
    });

    it('should respect filtering options', async () => {
      const links = [sampleLinkWithDetails];
      mockRepository.findByEntity.mockResolvedValue(links);

      await service.getEntityLinks(validTaskEntity, {
        kinds: ['depends_on'],
        includeInactive: true,
        direction: 'outgoing',
      });

      expect(mockRepository.findByEntity).toHaveBeenCalledWith(
        validTaskEntity,
        {
          kinds: ['depends_on'],
          includeInactive: true,
          direction: 'outgoing',
        }
      );
    });

    it('should use cache when available', async () => {
      const links = [sampleLinkWithDetails];
      mockRepository.findByEntity.mockResolvedValue(links);

      // First call
      const result1 = await service.getEntityLinks(validTaskEntity);
      expect(result1).toEqual(links);
      expect(mockRepository.findByEntity).toHaveBeenCalledTimes(1);

      // Second call with same parameters - should use cache
      const result2 = await service.getEntityLinks(validTaskEntity);
      expect(result2).toEqual(links);
      expect(mockRepository.findByEntity).toHaveBeenCalledTimes(1); // No additional calls
    });
  });

  describe('findLinks', () => {
    it('should find links by criteria', async () => {
      const links = [sampleLinkWithDetails];
      mockRepository.findByCriteria.mockResolvedValue(links);

      const result = await service.findLinks(
        'task',
        'project',
        'depends_on',
        validTenantId
      );

      expect(result).toEqual(links);
      expect(mockRepository.findByCriteria).toHaveBeenCalledWith({
        fromType: 'task',
        toType: 'project',
        kind: 'depends_on',
        tenantId: validTenantId,
        active: true, // Default behavior
      });
    });

    it('should include inactive links when requested', async () => {
      const links = [sampleLinkWithDetails];
      mockRepository.findByCriteria.mockResolvedValue(links);

      await service.findLinks(
        'task',
        'project',
        'depends_on',
        validTenantId,
        { includeInactive: true }
      );

      expect(mockRepository.findByCriteria).toHaveBeenCalledWith({
        fromType: 'task',
        toType: 'project',
        kind: 'depends_on',
        tenantId: validTenantId,
        active: false, // Should include inactive
      });
    });
  });

  describe('createBulkLinks', () => {
    it('should create multiple links successfully', async () => {
      const links = [
        { from: validTaskEntity, to: validProjectEntity, kind: 'depends_on' as LinkKind },
        { from: validTaskEntity, to: validUserEntity, kind: 'assigned_to' as LinkKind },
      ];
      const createdLinks = [
        { ...sampleLink, id: 'link_1' },
        { ...sampleLink, id: 'link_2', toType: 'user', toId: 'user_1', kind: 'assigned_to' },
      ];

      MockedValidator.validateBulkLinks.mockResolvedValue({
        valid: true,
        results: [
          { valid: true, errors: [] },
          { valid: true, errors: [] },
        ],
      });

      mockRepository.linkExists.mockResolvedValue(null);
      mockRepository.create
        .mockResolvedValueOnce(createdLinks[0])
        .mockResolvedValueOnce(createdLinks[1]);

      const result = await service.createBulkLinks(links, validTenantId);

      expect(result).toEqual(createdLinks);
      expect(MockedValidator.validateBulkLinks).toHaveBeenCalledWith(
        links,
        expect.any(Object)
      );
      expect(mockRepository.create).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures when allowed', async () => {
      const links = [
        { from: validTaskEntity, to: validProjectEntity, kind: 'depends_on' as LinkKind },
        { from: validTaskEntity, to: validUserEntity, kind: 'assigned_to' as LinkKind },
      ];

      MockedValidator.validateBulkLinks.mockResolvedValue({
        valid: true,
        results: [
          { valid: true, errors: [] },
          { valid: true, errors: [] },
        ],
      });

      mockRepository.linkExists.mockResolvedValue(null);
      mockRepository.create
        .mockResolvedValueOnce({ ...sampleLink, id: 'link_1' })
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await service.createBulkLinks(links, validTenantId, {
        allowPartialFailure: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('link_1');
    });

    it('should reject bulk creation on validation failure', async () => {
      const links = [
        { from: validTaskEntity, to: validProjectEntity, kind: 'invalid_kind' as any },
      ];

      MockedValidator.validateBulkLinks.mockResolvedValue({
        valid: false,
        results: [
          {
            valid: false,
            errors: [{ code: EntityLinkErrorCode.INVALID_LINK_KIND, message: 'Invalid' }],
          },
        ],
      });

      await expect(
        service.createBulkLinks(links, validTenantId)
      ).rejects.toThrow(EntityLinkError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteBulkLinks', () => {
    it('should soft delete multiple links', async () => {
      const linkIds = ['link_1', 'link_2'];

      await service.deleteBulkLinks(linkIds, validTenantId, true);

      expect(mockRepository.update).toHaveBeenCalledTimes(2);
      expect(mockRepository.update).toHaveBeenCalledWith('link_1', { active: false }, validTenantId);
      expect(mockRepository.update).toHaveBeenCalledWith('link_2', { active: false }, validTenantId);
      expect(mockRepository.deleteMany).not.toHaveBeenCalled();
    });

    it('should hard delete multiple links', async () => {
      const linkIds = ['link_1', 'link_2'];

      await service.deleteBulkLinks(linkIds, validTenantId, false);

      expect(mockRepository.deleteMany).toHaveBeenCalledWith(linkIds, validTenantId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Graph Operations', () => {
    it('should build entity graph', async () => {
      const links = [sampleLinkWithDetails];
      mockRepository.findByEntity.mockResolvedValue(links);

      const result = await service.getEntityGraph(validTaskEntity, 2);

      expect(result.nodes).toHaveLength(2); // Task + Project
      expect(result.edges).toHaveLength(1);
      expect(mockRepository.findByEntity).toHaveBeenCalled();
    });

    it('should find paths between entities', async () => {
      const links = [sampleLinkWithDetails];
      mockRepository.findByEntity.mockResolvedValue(links);

      const result = await service.findPath(validTaskEntity, validProjectEntity);

      expect(result).toBeInstanceOf(Array);
      expect(mockRepository.findByEntity).toHaveBeenCalled();
    });

    it('should validate cycle prevention', async () => {
      const links: EntityLinkWithDetails[] = [];
      mockRepository.findByEntity.mockResolvedValue(links);

      const result = await service.validateNoCycle(
        validTaskEntity,
        validProjectEntity,
        'depends_on'
      );

      expect(result).toBe(true); // No cycle found
    });

    it('should detect potential cycles', async () => {
      // Mock a scenario where there's already a path from project to task
      const reverseLink: EntityLinkWithDetails = {
        ...sampleLinkWithDetails,
        fromType: 'project',
        fromId: 'project_1',
        toType: 'task',
        toId: 'task_1',
        kind: 'blocks',
      };

      mockRepository.findByEntity.mockResolvedValue([reverseLink]);

      const result = await service.validateNoCycle(
        validTaskEntity,
        validProjectEntity,
        'depends_on'
      );

      expect(result).toBe(false); // Cycle would be created
    });
  });

  describe('Cache Management', () => {
    it('should invalidate cache for specific entity', async () => {
      // Fill cache first
      mockRepository.findByEntity.mockResolvedValue([sampleLinkWithDetails]);
      await service.getEntityLinks(validTaskEntity);

      // Invalidate cache
      await service.invalidateCache(validTaskEntity);

      // Next call should hit repository again
      await service.getEntityLinks(validTaskEntity);
      expect(mockRepository.findByEntity).toHaveBeenCalledTimes(2);
    });

    it('should invalidate all cache', async () => {
      // Fill cache first
      mockRepository.findByEntity.mockResolvedValue([sampleLinkWithDetails]);
      await service.getEntityLinks(validTaskEntity);

      // Invalidate all cache
      await service.invalidateCache();

      // Next call should hit repository again
      await service.getEntityLinks(validTaskEntity);
      expect(mockRepository.findByEntity).toHaveBeenCalledTimes(2);
    });

    it('should warm cache for multiple entities', async () => {
      const entities = [validTaskEntity, validProjectEntity];
      mockRepository.findByEntity.mockResolvedValue([]);

      await service.warmCache(entities);

      expect(mockRepository.findByEntity).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should wrap repository errors in EntityLinkError', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database connection lost'));

      await expect(
        service.getLink('link_123', validTenantId)
      ).rejects.toThrow(EntityLinkError);
    });

    it('should preserve EntityLinkError instances', async () => {
      const originalError = new EntityLinkError(
        'Custom error',
        EntityLinkErrorCode.PERMISSION_DENIED
      );
      
      MockedValidator.validateLink.mockRejectedValue(originalError);

      await expect(
        service.createLink(validTaskEntity, validProjectEntity, 'depends_on')
      ).rejects.toThrow(EntityLinkError);
    });

    it('should handle malformed input gracefully', async () => {
      await expect(
        service.createLink(null as any, validProjectEntity, 'depends_on')
      ).rejects.toThrow(EntityLinkError);
    });
  });
});