// Mock data and utilities for testing and development
export const mockUsers = [
  { id: '1', email: 'john@example.com', name: 'John Doe' },
  { id: '2', email: 'jane@example.com', name: 'Jane Smith' },
  { id: '3', email: 'admin@ria.com', name: 'RIA Admin' },
];

export const mockClients = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    type: 'Corporate',
    status: 'Active',
  },
  {
    id: '2', 
    name: 'Smith Family Trust',
    email: 'trustee@smithfamily.com',
    type: 'Trust',
    status: 'Active',
  },
];

export const delay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));