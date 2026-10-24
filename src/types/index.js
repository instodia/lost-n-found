export const ITEM_TYPES = {
  LOST: 'LOST',
  FOUND: 'FOUND',
};

export const ITEM_STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING_CLAIM: 'PENDING_CLAIM',
  RESOLVED: 'RESOLVED', // Recovered or Returned
  REJECTED: 'REJECTED',
};

export const CLAIM_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: 'Smartphone', description: 'Phones, laptops, headphones, chargers' },
  { id: 'documents', name: 'Documents & IDs', icon: 'FileText', description: 'Passports, driver licenses, student cards' },
  { id: 'bags', name: 'Bags & Wallets', icon: 'Briefcase', description: 'Backpacks, purses, wallets, luggage' },
  { id: 'keys', name: 'Keys', icon: 'Key', description: 'House keys, car fobs, locker keys' },
  { id: 'accessories', name: 'Accessories & Jewelry', icon: 'Watch', description: 'Watches, rings, glasses, jewelry' },
  { id: 'clothing', name: 'Clothing & Apparel', icon: 'Shirt', description: 'Jackets, coats, hats, shoes' },
  { id: 'pets', name: 'Pets', icon: 'Heart', description: 'Dogs, cats, collars, pet carriers' },
  { id: 'others', name: 'Others', icon: 'Package', description: 'Books, sports gear, musical instruments' },
];

export const SYSTEM_ACCOUNTS = [
  {
    id: 'acc-admin1',
    username: 'admin1',
    password: 'admin1',
    name: 'Admin One (Lead)',
    email: 'admin1@findit.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 901-0001',
    joinedDate: '2023-08-01',
    verified: true,
    badge: 'Senior Safety Admin',
  },
  {
    id: 'acc-admin2',
    username: 'admin2',
    password: 'admin2',
    name: 'Admin Two (Supervisor)',
    email: 'admin2@findit.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 901-0002',
    joinedDate: '2023-10-15',
    verified: true,
    badge: 'Moderation Officer',
  },
  {
    id: 'acc-user1',
    username: 'user1',
    password: 'user1',
    name: 'Alex Rivera',
    email: 'user1@findit.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-8901',
    joinedDate: '2024-01-10',
    verified: true,
  },
  {
    id: 'acc-user2',
    username: 'user2',
    password: 'user2',
    name: 'Brianna Smith',
    email: 'user2@findit.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 345-6789',
    joinedDate: '2024-02-14',
    verified: true,
  },
  {
    id: 'acc-user3',
    username: 'user3',
    password: 'user3',
    name: 'Carlos Mendez',
    email: 'user3@findit.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 456-7890',
    joinedDate: '2024-03-20',
    verified: true,
  },
];

export const DEMO_USERS = SYSTEM_ACCOUNTS;

