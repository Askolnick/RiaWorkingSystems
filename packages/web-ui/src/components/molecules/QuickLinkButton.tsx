import React, { useState } from 'react';
import { EntityRef, LinkKind } from '@ria/client';
import { Button } from '../../Button/Button';
import { Modal } from './Modal';
import { EntityLinkViewer } from '../entity-links/EntityLinkViewer';

interface QuickLinkButtonProps {
  entity: EntityRef;
  buttonText?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  buttonSize?: 'sm' | 'md' | 'lg';
  allowedKinds?: LinkKind[];
  onLinkCreated?: (link: any) => void;
  className?: string;
}

export const QuickLinkButton: React.FC<QuickLinkButtonProps> = ({
  entity,
  buttonText = 'Quick Link',
  buttonVariant = 'outline',
  buttonSize = 'sm',
  allowedKinds,
  onLinkCreated,
  className,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLinkCreated = (link: any) => {
    setIsModalOpen(false);
    onLinkCreated?.(link);
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={buttonVariant}
        size={buttonSize}
        className={className}
      >
        {buttonText}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Quick Link"
        size="md"
      >
        <EntityLinkViewer
          entity={entity}
          allowedLinkKinds={allowedKinds}
          onLinkCreated={handleLinkCreated}
        />
      </Modal>
    </>
  );
};

// Inline quick link button for use in dropdowns or menus
export const QuickLinkMenuItem: React.FC<{
  entity: EntityRef;
  onLinkCreated?: (link: any) => void;
  className?: string;
}> = ({ entity, onLinkCreated, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLinkCreated = (link: any) => {
    setIsModalOpen(false);
    onLinkCreated?.(link);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${className}`}
      >
        Create Link
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Quick Link"
        size="md"
      >
        <EntityLinkViewer
          entity={entity}
          onLinkCreated={handleLinkCreated}
        />
      </Modal>
    </>
  );
};