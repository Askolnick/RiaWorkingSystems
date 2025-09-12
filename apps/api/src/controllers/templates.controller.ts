/**
 * Templates Controller
 * 
 * API endpoints for business template management
 */

import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Body, 
  Param, 
  Query,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { 
  TemplateService,
  CreateTemplateInstanceDto,
  UpdateTemplateInstanceDto,
  TemplateFilter
} from '@ria/templates-server';

@Controller('templates')
export class TemplatesController {
  private templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
  }

  /**
   * Get all available templates
   */
  @Get()
  async getTemplates(
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('includeMetrics') includeMetrics?: string
  ): Promise<any> {
    try {
      const filter: TemplateFilter = {};
      
      if (category) {
        filter.category = [category as any];
      }
      
      if (type) {
        filter.type = [type as any];
      }
      
      if (search) {
        filter.search = search;
      }

      const result = await this.templateService.getTemplates({
        tenantId: 'default', // TODO: Get from auth context
        filter,
        includeMetrics: includeMetrics === 'true'
      });

      return {
        success: true,
        data: result.templates,
        metrics: result.metrics ? Object.fromEntries(result.metrics) : undefined,
        count: result.templates.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get a specific template by ID
   */
  @Get(':id')
  async getTemplate(
    @Param('id') templateId: string,
    @Query('includeMetrics') includeMetrics?: string
  ): Promise<any> {
    try {
      const result = await this.templateService.getTemplate(
        templateId,
        includeMetrics === 'true'
      );

      if (!result.template) {
        throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: result.template,
        metrics: result.metrics
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create a new template instance
   */
  @Post('instances')
  async createInstance(
    @Body() dto: CreateTemplateInstanceDto
  ): Promise<any> {
    try {
      // TODO: Get tenantId and userId from auth context
      const instance = await this.templateService.createTemplateInstance({
        ...dto,
        tenantId: dto.tenantId || 'default',
        createdBy: dto.createdBy || 'system'
      });

      return {
        success: true,
        data: instance,
        message: 'Template instance created successfully'
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create template instance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Get a template instance
   */
  @Get('instances/:id')
  async getInstance(
    @Param('id') instanceId: string
  ): Promise<any> {
    try {
      const instance = await this.templateService.getTemplateInstance(
        instanceId,
        'default' // TODO: Get from auth context
      );

      if (!instance) {
        throw new HttpException('Template instance not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: instance
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch template instance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update a template instance
   */
  @Put('instances/:id')
  async updateInstance(
    @Param('id') instanceId: string,
    @Body() dto: UpdateTemplateInstanceDto
  ): Promise<any> {
    try {
      const instance = await this.templateService.updateTemplateInstance(
        instanceId,
        'default', // TODO: Get from auth context
        dto
      );

      return {
        success: true,
        data: instance,
        message: 'Template instance updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        `Failed to update template instance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Generate task list for a template instance
   */
  @Get('instances/:id/tasks')
  async getInstanceTasks(
    @Param('id') instanceId: string
  ): Promise<any> {
    try {
      const tasks = await this.templateService.generateTaskList(
        instanceId,
        'default' // TODO: Get from auth context
      );

      return {
        success: true,
        data: tasks,
        count: tasks.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to generate task list: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Export a template as JSON
   */
  @Get(':id/export')
  async exportTemplate(
    @Param('id') templateId: string
  ): Promise<any> {
    try {
      const templateJson = await this.templateService.exportTemplate(templateId);

      return {
        success: true,
        data: templateJson,
        filename: `template-${templateId}-${Date.now()}.json`
      };
    } catch (error) {
      throw new HttpException(
        `Failed to export template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Import a template from JSON
   */
  @Post('import')
  async importTemplate(
    @Body() body: { templateJson: string }
  ): Promise<any> {
    try {
      const template = await this.templateService.importTemplate(
        body.templateJson,
        'default' // TODO: Get from auth context
      );

      return {
        success: true,
        data: template,
        message: 'Template imported successfully'
      };
    } catch (error) {
      throw new HttpException(
        `Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Get template recommendations
   */
  @Get('recommendations')
  async getRecommendations(
    @Query('industry') industry?: string,
    @Query('companySize') companySize?: string
  ): Promise<any> {
    try {
      const recommendations = await this.templateService.getRecommendations({
        industry,
        companySize,
        tenantId: 'default' // TODO: Get from auth context
      });

      return {
        success: true,
        data: recommendations,
        count: recommendations.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Clone a template
   */
  @Post(':id/clone')
  async cloneTemplate(
    @Param('id') templateId: string,
    @Body() body: { name: string }
  ): Promise<any> {
    try {
      const cloned = await this.templateService.cloneTemplate(
        templateId,
        body.name,
        'default' // TODO: Get from auth context
      );

      return {
        success: true,
        data: cloned,
        message: 'Template cloned successfully'
      };
    } catch (error) {
      throw new HttpException(
        `Failed to clone template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Get template statistics
   */
  @Get('stats')
  async getStats(): Promise<any> {
    try {
      const stats = await this.templateService.getTemplateStats(
        'default' // TODO: Get from auth context
      );

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get template stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}