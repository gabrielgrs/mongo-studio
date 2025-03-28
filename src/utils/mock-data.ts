// Mock data for MongoDB databases, collections, and documents

export const mockDatabases = [
  {
    name: 'admin',
    collections: [
      {
        name: 'users',
        documents: [
          {
            _id: '507f1f77bcf86cd799439011',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            lastLogin: '2023-04-15T10:30:00Z',
            permissions: ['read', 'write', 'delete', 'manage_users'],
          },
        ],
      },
      {
        name: 'settings',
        documents: [
          {
            _id: '507f1f77bcf86cd799439012',
            setting: 'backup',
            value: 'daily',
            lastModified: '2023-03-10T08:15:00Z',
          },
          {
            _id: '507f1f77bcf86cd799439013',
            setting: 'retention',
            value: '30days',
            lastModified: '2023-02-22T14:45:00Z',
          },
        ],
      },
    ],
  },
  {
    name: 'ecommerce',
    collections: [
      {
        name: 'products',
        documents: [
          {
            _id: '507f1f77bcf86cd799439014',
            name: 'Smartphone X',
            price: 999.99,
            category: 'Electronics',
            stock: 120,
            features: ['5G', 'Triple Camera', 'Fast Charging'],
            specifications: {
              display: '6.7 inch OLED',
              processor: 'Snapdragon 8 Gen 2',
              battery: '5000mAh',
            },
            ratings: [4.5, 5, 4, 4.5, 5],
          },
          {
            _id: '507f1f77bcf86cd799439015',
            name: 'Laptop Pro',
            price: 1499.99,
            category: 'Electronics',
            stock: 45,
            features: ['16GB RAM', '512GB SSD', '14-hour battery'],
            specifications: {
              display: '15.6 inch 4K',
              processor: 'Intel i9',
              battery: '95Wh',
            },
            ratings: [5, 4.5, 4.5, 5, 4],
          },
          {
            _id: '507f1f77bcf86cd799439016',
            name: 'Wireless Headphones',
            price: 199.99,
            category: 'Audio',
            stock: 78,
            features: ['Noise Cancellation', '30h Battery', 'Hi-Fi Sound'],
            specifications: {
              driver: '40mm',
              bluetooth: '5.2',
              weight: '250g',
            },
            ratings: [4, 4, 3.5, 4.5, 5],
          },
        ],
      },
      {
        name: 'customers',
        documents: [
          {
            _id: '507f1f77bcf86cd799439017',
            name: 'John Doe',
            email: 'john@example.com',
            address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: '10001',
            },
            orders: [
              { id: 'ORD-001', date: '2023-01-15T14:22:00Z', total: 1299.98 },
              { id: 'ORD-008', date: '2023-03-22T09:45:00Z', total: 199.99 },
            ],
          },
          {
            _id: '507f1f77bcf86cd799439018',
            name: 'Jane Smith',
            email: 'jane@example.com',
            address: {
              street: '456 Oak Ave',
              city: 'San Francisco',
              state: 'CA',
              zip: '94107',
            },
            orders: [{ id: 'ORD-005', date: '2023-02-10T11:32:00Z', total: 999.99 }],
          },
        ],
      },
      {
        name: 'orders',
        documents: [
          {
            _id: '507f1f77bcf86cd799439019',
            orderId: 'ORD-001',
            customerId: '507f1f77bcf86cd799439017',
            date: '2023-01-15T14:22:00Z',
            items: [
              { productId: '507f1f77bcf86cd799439014', quantity: 1, price: 999.99 },
              { productId: '507f1f77bcf86cd799439016', quantity: 1, price: 199.99 },
            ],
            total: 1299.98,
            status: 'delivered',
            shipping: {
              method: 'Express',
              cost: 15.99,
              address: {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zip: '10001',
              },
            },
          },
          {
            _id: '507f1f77bcf86cd799439020',
            orderId: 'ORD-005',
            customerId: '507f1f77bcf86cd799439018',
            date: '2023-02-10T11:32:00Z',
            items: [{ productId: '507f1f77bcf86cd799439014', quantity: 1, price: 999.99 }],
            total: 999.99,
            status: 'delivered',
            shipping: {
              method: 'Standard',
              cost: 9.99,
              address: {
                street: '456 Oak Ave',
                city: 'San Francisco',
                state: 'CA',
                zip: '94107',
              },
            },
          },
          {
            _id: '507f1f77bcf86cd799439021',
            orderId: 'ORD-008',
            customerId: '507f1f77bcf86cd799439017',
            date: '2023-03-22T09:45:00Z',
            items: [{ productId: '507f1f77bcf86cd799439016', quantity: 1, price: 199.99 }],
            total: 199.99,
            status: 'processing',
            shipping: {
              method: 'Standard',
              cost: 9.99,
              address: {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zip: '10001',
              },
            },
          },
        ],
      },
    ],
  },
  {
    name: 'blog',
    collections: [
      {
        name: 'posts',
        documents: [
          {
            _id: '507f1f77bcf86cd799439022',
            title: 'Getting Started with MongoDB',
            author: '507f1f77bcf86cd799439023',
            content:
              'MongoDB is a document database with the scalability and flexibility that you want with the querying and indexing that you need...',
            tags: ['mongodb', 'database', 'nosql'],
            date: '2023-01-05T08:30:00Z',
            comments: [
              {
                user: '507f1f77bcf86cd799439024',
                text: 'Great introduction to MongoDB!',
                date: '2023-01-06T10:15:00Z',
              },
            ],
            views: 1250,
          },
          {
            _id: '507f1f77bcf86cd799439025',
            title: 'Advanced MongoDB Aggregation',
            author: '507f1f77bcf86cd799439023',
            content:
              'The aggregation pipeline is a framework for data aggregation modeled on the concept of data processing pipelines...',
            tags: ['mongodb', 'aggregation', 'advanced'],
            date: '2023-02-12T14:20:00Z',
            comments: [
              {
                user: '507f1f77bcf86cd799439026',
                text: 'This helped me solve a complex query issue!',
                date: '2023-02-13T09:45:00Z',
              },
              {
                user: '507f1f77bcf86cd799439024',
                text: 'Could you provide more examples?',
                date: '2023-02-14T16:30:00Z',
              },
            ],
            views: 876,
          },
        ],
      },
      {
        name: 'authors',
        documents: [
          {
            _id: '507f1f77bcf86cd799439023',
            name: 'MongoDB Expert',
            email: 'expert@blog.com',
            bio: 'Database professional with 10 years of experience in NoSQL solutions.',
            articles: ['507f1f77bcf86cd799439022', '507f1f77bcf86cd799439025'],
            social: {
              twitter: '@mongoexpert',
              github: 'mongoexpert',
            },
          },
          {
            _id: '507f1f77bcf86cd799439027',
            name: 'Database Enthusiast',
            email: 'enthusiast@blog.com',
            bio: 'Self-taught database developer with a passion for MongoDB.',
            articles: [],
            social: {
              twitter: '@dbfan',
              github: 'dbfan',
            },
          },
        ],
      },
      {
        name: 'comments',
        documents: [
          {
            _id: '507f1f77bcf86cd799439028',
            postId: '507f1f77bcf86cd799439022',
            user: '507f1f77bcf86cd799439024',
            text: 'Great introduction to MongoDB!',
            date: '2023-01-06T10:15:00Z',
          },
          {
            _id: '507f1f77bcf86cd799439029',
            postId: '507f1f77bcf86cd799439025',
            user: '507f1f77bcf86cd799439026',
            text: 'This helped me solve a complex query issue!',
            date: '2023-02-13T09:45:00Z',
          },
          {
            _id: '507f1f77bcf86cd799439030',
            postId: '507f1f77bcf86cd799439025',
            user: '507f1f77bcf86cd799439024',
            text: 'Could you provide more examples?',
            date: '2023-02-14T16:30:00Z',
          },
        ],
      },
    ],
  },
  {
    name: 'analytics',
    collections: [
      {
        name: 'pageviews',
        documents: [
          {
            _id: '507f1f77bcf86cd799439031',
            page: '/home',
            views: 12500,
            uniqueVisitors: 8750,
            avgTimeOnPage: 125,
            bounceRate: 0.35,
            byDevice: {
              desktop: 7500,
              mobile: 4000,
              tablet: 1000,
            },
            byCountry: [
              { country: 'US', views: 5500 },
              { country: 'UK', views: 2000 },
              { country: 'CA', views: 1500 },
              { country: 'Other', views: 3500 },
            ],
          },
          {
            _id: '507f1f77bcf86cd799439032',
            page: '/products',
            views: 8900,
            uniqueVisitors: 6200,
            avgTimeOnPage: 180,
            bounceRate: 0.25,
            byDevice: {
              desktop: 5300,
              mobile: 2800,
              tablet: 800,
            },
            byCountry: [
              { country: 'US', views: 3900 },
              { country: 'UK', views: 1400 },
              { country: 'CA', views: 1100 },
              { country: 'Other', views: 2500 },
            ],
          },
        ],
      },
      {
        name: 'events',
        documents: [
          {
            _id: '507f1f77bcf86cd799439033',
            event: 'button_click',
            element: 'add_to_cart',
            count: 4500,
            conversionRate: 0.28,
            byPage: [
              { page: '/products', count: 3200 },
              { page: '/featured', count: 1300 },
            ],
          },
          {
            _id: '507f1f77bcf86cd799439034',
            event: 'form_submit',
            element: 'checkout',
            count: 1200,
            conversionRate: 0.85,
            byPage: [{ page: '/cart', count: 1200 }],
          },
        ],
      },
    ],
  },
]
