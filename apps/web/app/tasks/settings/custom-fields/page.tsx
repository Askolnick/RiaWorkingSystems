'use client';

import { useEffect } from 'react';
import { useTasksStore } from '@ria/client';
import { CustomFieldsManager } from '@ria/web-ui';

export default function TasksCustomFieldsPage() {
  const {
    customFields,
    customFieldsLoading,
    error,
    fetchCustomFields,
    createCustomField,
    updateCustomField,
    deleteCustomField,
    clearError
  } = useTasksStore();

  useEffect(() => {
    fetchCustomFields();
  }, [fetchCustomFields]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  return (
    <div className="container mx-auto px-4 py-8">
      <CustomFieldsManager
        customFields={customFields}
        loading={customFieldsLoading}
        error={error}
        onCreateField={createCustomField}
        onUpdateField={updateCustomField}
        onDeleteField={deleteCustomField}
      />
    </div>
  );
}