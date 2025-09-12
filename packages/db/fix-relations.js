#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the schema file
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Map of relation names that need to be added
const relationMappings = [
  // Expense models
  { model: 'ExpenseCategory', field: 'creator', relation: 'ExpenseCategoryCreator' },
  { model: 'Expense', field: 'creator', relation: 'ExpenseCreator' },
  { model: 'Expense', field: 'submitter', relation: 'ExpenseSubmitter' },
  { model: 'Expense', field: 'approver', relation: 'ExpenseApprover' },
  { model: 'ExpenseAttachment', field: 'uploader', relation: 'ExpenseAttachmentUploader' },
  { model: 'ExpenseComment', field: 'author', relation: 'ExpenseCommentAuthor' },
  { model: 'ExpenseReport', field: 'creator', relation: 'ExpenseReportCreator' },
  { model: 'ExpenseReport', field: 'submitter', relation: 'ExpenseReportSubmitter' },
  { model: 'ExpenseReport', field: 'approver', relation: 'ExpenseReportApprover' },
  
  // Product models
  { model: 'ProductCategory', field: 'creator', relation: 'ProductCategoryCreator' },
  { model: 'Product', field: 'creator', relation: 'ProductCreator' },
  { model: 'ProductImage', field: 'uploader', relation: 'ProductImageUploader' },
  { model: 'ProductReview', field: 'user', relation: 'ProductReviewer' },
  { model: 'ProductAttribute', field: 'creator', relation: 'ProductAttributeCreator' },
  
  // Roadmap models
  { model: 'ProductRoadmap', field: 'creator', relation: 'RoadmapCreator' },
  { model: 'RoadmapCategory', field: 'creator', relation: 'RoadmapCategoryCreator' },
  { model: 'RoadmapRelease', field: 'creator', relation: 'RoadmapReleaseCreator' },
  { model: 'RoadmapReleaseNote', field: 'creator', relation: 'RoadmapReleaseNoteCreator' },
  { model: 'RoadmapItemComment', field: 'creator', relation: 'RoadmapCommentCreator' },
  { model: 'RoadmapItemVote', field: 'voter', relation: 'RoadmapVoter' },
  { model: 'RoadmapItemWatcher', field: 'watcher', relation: 'RoadmapWatcher' },
  { model: 'RoadmapItemActivity', field: 'creator', relation: 'RoadmapActivityCreator' },
  { model: 'RoadmapItemAttachment', field: 'uploader', relation: 'RoadmapAttachmentUploader' },
  { model: 'RoadmapContributor', field: 'user', relation: 'RoadmapContributorUser' },
  { model: 'RoadmapContributor', field: 'inviter', relation: 'RoadmapInviter' },
  { model: 'RoadmapFollower', field: 'follower', relation: 'RoadmapFollowerUser' },
  { model: 'RoadmapCustomField', field: 'creator', relation: 'RoadmapCustomFieldCreator' },
  
  // Campaign models
  { model: 'Campaign', field: 'creator', relation: 'CampaignCreator' },
  { model: 'CampaignAudience', field: 'creator', relation: 'CampaignAudienceCreator' },
  { model: 'CampaignAsset', field: 'uploader', relation: 'CampaignAssetUploader' },
  { model: 'CampaignAutomation', field: 'creator', relation: 'CampaignAutomationCreator' },
  { model: 'CampaignTag', field: 'creator', relation: 'CampaignTagCreator' },
  
  // Feedback models
  { model: 'Feedback', field: 'user', relation: 'FeedbackUser' },
  { model: 'Feedback', field: 'submitter', relation: 'FeedbackSubmitter' },
  { model: 'Feedback', field: 'assignee', relation: 'FeedbackAssignee' },
  { model: 'Feedback', field: 'resolver', relation: 'FeedbackResolver' },
  { model: 'FeedbackCategory', field: 'creator', relation: 'FeedbackCategoryCreator' },
  { model: 'FeedbackCategory', field: 'autoAssignee', relation: 'CategoryAutoAssignee' },
  { model: 'FeedbackSubcategory', field: 'creator', relation: 'FeedbackSubcategoryCreator' },
  { model: 'FeedbackComment', field: 'creator', relation: 'FeedbackCommentCreator' },
  { model: 'FeedbackVote', field: 'voter', relation: 'FeedbackVoter' },
  { model: 'FeedbackAttachment', field: 'uploader', relation: 'FeedbackAttachmentUploader' },
  { model: 'FeedbackActivity', field: 'creator', relation: 'FeedbackActivityCreator' },
  { model: 'FeedbackFollower', field: 'follower', relation: 'FeedbackFollowerUser' },
  { model: 'FeedbackLink', field: 'creator', relation: 'FeedbackLinkCreator' },
  { model: 'FeedbackCustomField', field: 'creator', relation: 'FeedbackCustomFieldCreator' },
  
  // People Management models
  { model: 'Department', field: 'creator', relation: 'DepartmentCreator' },
  { model: 'Location', field: 'creator', relation: 'LocationCreator' },
  { model: 'LeaveRequest', field: 'approver', relation: 'LeaveRequestApprover' },
  { model: 'TimeEntry', field: 'approver', relation: 'TimeEntryApprover' },
  { model: 'PerformanceReview', field: 'reviewer', relation: 'PerformanceReviewer' },
  { model: 'EmployeeBenefit', field: 'enroller', relation: 'BenefitEnroller' },
  { model: 'EmployeeDocument', field: 'uploader', relation: 'EmployeeDocumentUploader' },
  { model: 'CompensationHistory', field: 'approver', relation: 'CompensationApprover' },
];

console.log('Fixing relations in schema...');

// Process each mapping
relationMappings.forEach(({ model, field, relation }) => {
  // Create a regex to find the relation line in the model
  const modelRegex = new RegExp(`(model ${model} {[^}]*?)(\n\\s+${field}\\s+User[?]?\\s+@relation\\()([^)]*)(\\))`, 'g');
  
  schema = schema.replace(modelRegex, (match, before, relationStart, relationContent, relationEnd) => {
    // Check if relation name already exists
    if (relationContent.includes('"')) {
      console.log(`Relation name already exists for ${model}.${field}`);
      return match;
    }
    
    // Add the relation name
    const newRelationContent = `"${relation}"` + (relationContent ? ', ' + relationContent : '');
    const result = before + relationStart + newRelationContent + relationEnd;
    console.log(`Fixed: ${model}.${field} -> ${relation}`);
    return result;
  });
});

// Write the updated schema
fs.writeFileSync(schemaPath, schema);
console.log('Schema file updated successfully!');