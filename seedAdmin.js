import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Connected to MongoDB');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const db = client.db('styledecor');
    
    const existingAdmin = await db.collection('users').findOne({ 
      email: 'admin@styledecor.com' 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: admin@styledecor.com');
      console.log('🔑 Password: Admin@123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      await client.close();
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const adminUser = {
      name: 'Redwan Shahriar',
      email: 'admin@styledecor.com',
      password: hashedPassword,
      photoURL: 'https://i.ibb.co/d5WSD4V/admin-avatar.png',
      role: 'admin',
      status: 'active',
      createdAt: new Date()
    };

    await db.collection('users').insertOne(adminUser);
    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Name: Redwan Shahriar');
    console.log('📧 Email: admin@styledecor.com');
    console.log('🔑 Password: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const sampleServices = [
      {
        service_name: 'Wedding Hall Decoration',
        cost: 50000,
        unit: 'full package',
        service_category: 'wedding',
        description: 'Complete wedding hall decoration with flowers, lights, and stage setup. Includes entrance decoration, seating arrangement, and photo booth.',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        createdByEmail: 'admin@styledecor.com',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        service_name: 'Home Interior Decoration',
        cost: 15000,
        unit: 'per room',
        service_category: 'home',
        description: 'Professional home interior decoration including wall art, curtains, furniture arrangement, and accent pieces.',
        image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800',
        createdByEmail: 'admin@styledecor.com',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        service_name: 'Office Space Setup',
        cost: 25000,
        unit: 'per floor',
        service_category: 'office',
        description: 'Modern office decoration with ergonomic furniture, plants, lighting, and professional workspace design.',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        createdByEmail: 'admin@styledecor.com',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        service_name: 'Birthday Party Decoration',
        cost: 8000,
        unit: 'full package',
        service_category: 'event',
        description: 'Colorful birthday decoration with balloons, banners, themed setup, and cake table decoration.',
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
        createdByEmail: 'admin@styledecor.com',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        service_name: 'Seminar Hall Setup',
        cost: 12000,
        unit: 'per event',
        service_category: 'seminar',
        description: 'Professional seminar hall decoration with stage setup, seating arrangement, projector setup, and branding.',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        createdByEmail: 'admin@styledecor.com',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        service_name: 'Garden Party Decoration',
        cost: 18000,
        unit: 'full package',
        service_category: 'event',
        description: 'Outdoor garden party decoration with fairy lights, floral arrangements, seating, and ambient lighting.',
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        createdByEmail: 'admin@styledecor.com',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('services').insertMany(sampleServices);
    console.log('✅ 6 Sample services created successfully!');

    const decoratorPassword = await bcrypt.hash('Decorator@123', 10);
    const decorator = {
      name: 'Sarah Ahmed',
      email: 'decorator@styledecor.com',
      password: decoratorPassword,
      photoURL: 'https://i.ibb.co/XYZ1234/decorator.png',
      role: 'decorator',
      status: 'active',
      decoratorInfo: {
        specialty: 'Wedding & Event Decoration',
        experience: 5,
        rating: 4.9,
        totalProjects: 150
      },
      createdAt: new Date()
    };

    await db.collection('users').insertOne(decorator);
    console.log('✅ Sample decorator created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Decorator Name: Sarah Ahmed');
    console.log('📧 Decorator Email: decorator@styledecor.com');
    console.log('🔑 Decorator Password: Decorator@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('👨‍💻 Developed by: Redwan Shahriar');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
};

seedAdmin();
```

---

### **FILE 13: .gitignore**

**File: `styledecor-server/.gitignore`**
```
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env.production
.env.test

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
pnpm-debug.log*

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
desktop.ini

# IDE
.vscode/
.vscode/*
!.vscode/extensions.json
.idea/
.idea/*
*.swp
*.swo
*.swn
*~
.project
.classpath
.settings/

# Build outputs
dist/
build/
out/

# Temporary files
tmp/
temp/
*.tmp

# Testing
coverage/
.nyc_output/

# Other
.cache/