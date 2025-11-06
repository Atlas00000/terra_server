import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Create admin user
  const adminEmail = 'admin@terraindustries.com';
  const adminPassword = 'SecurePass123!';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✓ Admin user already exists');
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        fullName: 'Admin User',
        role: 'admin',
        isActive: true,
      },
    });

    console.log('✓ Created admin user:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  ID: ${admin.id}\n`);
  }

  // Create sample inquiries for testing
  const inquiryCount = await prisma.inquiry.count();
  
  if (inquiryCount === 0) {
    console.log('Creating sample inquiries...\n');

    // High priority inquiry
    await prisma.inquiry.create({
      data: {
        inquiryType: 'sales',
        fullName: 'General Ibrahim Babangida',
        email: 'general@defense.gov.ng',
        phone: '+234-803-555-0123',
        company: 'Nigerian Defense Ministry',
        country: 'NG',
        message: 'We urgently need to purchase 50 Archer VTOL units for border security operations. Budget approved: $10M.',
        status: 'new',
        leadScore: 85,
        metadata: {
          budget: '>$1M',
          timeline: 'immediate',
          orgType: 'government'
        },
        source: 'website',
      },
    });

    // Medium priority inquiry
    await prisma.inquiry.create({
      data: {
        inquiryType: 'partnership',
        fullName: 'Dr. Sarah Chen',
        email: 'sarah.chen@techcorp.com',
        phone: '+1-415-555-0789',
        company: 'TechCorp Defense Solutions',
        country: 'US',
        message: 'Interested in exploring partnership opportunities for VTOL technology integration.',
        status: 'new',
        leadScore: 55,
        metadata: {
          budget: '$100K-$500K',
          timeline: '3-6 months',
          orgType: 'commercial'
        },
        source: 'website',
      },
    });

    // Low priority inquiry
    await prisma.inquiry.create({
      data: {
        inquiryType: 'general',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        country: 'US',
        message: 'Just looking for general information about your products.',
        status: 'new',
        leadScore: 25,
        source: 'website',
      },
    });

    console.log('✓ Created 3 sample inquiries\n');
  } else {
    console.log(`✓ Found ${inquiryCount} existing inquiries\n`);
  }

  // Create sample news stories
  const newsCount = await prisma.newsStory.count();
  
  if (newsCount === 0) {
    console.log('Creating sample news stories...\n');

    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (admin) {
      await prisma.newsStory.createMany({
        data: [
          {
            title: 'Terra Industries Announces New VTOL Technology',
            slug: 'terra-industries-announces-new-vtol-technology',
            excerpt: 'Revolutionary vertical take-off and landing system unveiled at defense expo.',
            content: 'Terra Industries has announced groundbreaking advancements in VTOL technology...',
            status: 'published',
            category: 'Technology',
            tags: ['VTOL', 'Innovation', 'Featured'],
            publishedAt: new Date(),
            authorId: admin.id,
          },
          {
            title: 'Partnership with Nigerian Defense Ministry',
            slug: 'partnership-with-nigerian-defense-ministry',
            excerpt: 'Strategic partnership to enhance border security capabilities.',
            content: 'We are proud to announce our partnership with the Nigerian Defense Ministry...',
            status: 'published',
            category: 'Partnerships',
            tags: ['Partnership', 'Defense', 'Featured'],
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
            authorId: admin.id,
          },
          {
            title: 'Artemis UAV Completes Successful Field Trials',
            slug: 'artemis-uav-completes-successful-field-trials',
            excerpt: 'Advanced surveillance capabilities demonstrated in rigorous testing.',
            content: 'The Artemis UAV platform has successfully completed comprehensive field trials...',
            status: 'published',
            category: 'Product Updates',
            tags: ['Artemis', 'Testing', 'UAV'],
            publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
            authorId: admin.id,
          },
        ],
      });

      console.log('✓ Created 3 sample news stories\n');
    }
  } else {
    console.log(`✓ Found ${newsCount} existing news stories\n`);
  }

  // Create sample product specifications
  const productCount = await prisma.productSpecification.count();
  
  if (productCount === 0) {
    console.log('Creating sample product specifications...\n');

    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (admin) {
      await prisma.productSpecification.createMany({
        data: [
          {
            productName: 'Artemis',
            category: 'UAV',
            specifications: {
              platform: 'Fixed-Wing UAV',
              primaryRole: 'ISR (Intelligence, Surveillance, Reconnaissance)',
              maxAltitude: '25,000 ft',
              endurance: '24+ hours',
              range: '200 km',
              payload: '15 kg'
            },
            performanceMetrics: {
              maxSpeed: '150 km/h',
              cruiseSpeed: '90 km/h',
              climbRate: '5 m/s',
              serviceCell: '25,000 ft',
              windResistance: '45 km/h'
            },
            technicalDetails: {
              dimensions: {
                wingspan: '5.5m',
                length: '3.2m',
                height: '0.9m'
              },
              weight: {
                empty: '35 kg',
                maxTakeoff: '65 kg'
              },
              powerPlant: 'Electric propulsion system',
              launchMethod: 'Catapult or hand-launch',
              recoveryMethod: 'Parachute or net'
            },
            mediaGalleryIds: [],
            createdById: admin.id,
          },
          {
            productName: 'Archer',
            category: 'VTOL',
            specifications: {
              platform: 'Vertical Take-Off and Landing Aircraft',
              primaryRole: 'Tactical Transport & Logistics',
              maxAltitude: '15,000 ft',
              range: '400 km',
              payload: '500 kg',
              capacity: '4 personnel or cargo'
            },
            performanceMetrics: {
              maxSpeed: '250 km/h',
              cruiseSpeed: '180 km/h',
              hoverTime: '30 minutes',
              transitionTime: '< 3 seconds',
              verticalClimbRate: '8 m/s'
            },
            technicalDetails: {
              dimensions: {
                length: '8.5m',
                rotor_diameter: '12m',
                height: '3.5m'
              },
              weight: {
                empty: '1,200 kg',
                maxTakeoff: '2,000 kg'
              },
              powerPlant: 'Hybrid-electric propulsion',
              rotorConfiguration: 'Quad-tilt rotor',
              autonomy: 'Fully autonomous or piloted'
            },
            mediaGalleryIds: [],
            createdById: admin.id,
          },
          {
            productName: 'Iroko',
            category: 'Armored Vehicle',
            specifications: {
              platform: '4x4 Tactical Armored Vehicle',
              primaryRole: 'Personnel Transport & Security',
              crew: '2 + 8 passengers',
              armor: 'STANAG Level 2/3',
              range: '800 km',
              fuelCapacity: '200L'
            },
            performanceMetrics: {
              maxSpeed: '120 km/h',
              acceleration: '0-60 km/h in 12s',
              climbGradient: '60%',
              fordingDepth: '1.2m',
              trenchCrossing: '1.5m'
            },
            technicalDetails: {
              dimensions: {
                length: '5.8m',
                width: '2.4m',
                height: '2.2m'
              },
              weight: {
                curb: '8,500 kg',
                gross: '12,000 kg'
              },
              engine: 'Turbocharged diesel 6-cylinder',
              transmission: 'Automatic 6-speed',
              suspension: 'Independent coil spring'
            },
            mediaGalleryIds: [],
            createdById: admin.id,
          },
          {
            productName: 'Duma',
            category: 'Armored Vehicle',
            specifications: {
              platform: '6x6 Mine-Resistant Vehicle',
              primaryRole: 'Force Protection & IED Defense',
              crew: '2 + 10 passengers',
              armor: 'STANAG Level 3/4',
              range: '600 km',
              blastProtection: 'V-shaped hull, mine resistant'
            },
            performanceMetrics: {
              maxSpeed: '100 km/h',
              acceleration: '0-60 km/h in 18s',
              climbGradient: '70%',
              fordingDepth: '1.5m',
              obstacleHeight: '0.6m'
            },
            technicalDetails: {
              dimensions: {
                length: '7.2m',
                width: '2.7m',
                height: '2.8m'
              },
              weight: {
                curb: '16,000 kg',
                gross: '22,000 kg'
              },
              engine: 'Turbocharged diesel V8',
              transmission: 'Automatic 8-speed',
              suspension: 'Heavy-duty independent'
            },
            mediaGalleryIds: [],
            createdById: admin.id,
          },
          {
            productName: 'Kallon',
            category: 'Armored Vehicle',
            specifications: {
              platform: '4x4 Light Armored Patrol Vehicle',
              primaryRole: 'Reconnaissance & Border Patrol',
              crew: '2 + 4 passengers',
              armor: 'STANAG Level 1/2',
              range: '1,000 km',
              weaponMount: 'Optional turret ring'
            },
            performanceMetrics: {
              maxSpeed: '140 km/h',
              acceleration: '0-60 km/h in 9s',
              climbGradient: '65%',
              fordingDepth: '1m',
              turningRadius: '6m'
            },
            technicalDetails: {
              dimensions: {
                length: '5.2m',
                width: '2.2m',
                height: '2m'
              },
              weight: {
                curb: '6,500 kg',
                gross: '9,000 kg'
              },
              engine: 'Turbocharged diesel 4-cylinder',
              transmission: 'Manual/Automatic 5-speed',
              suspension: 'Independent with adjustable dampers'
            },
            mediaGalleryIds: [],
            createdById: admin.id,
          },
        ],
      });

      console.log('✓ Created 5 product specifications\n');
    }
  } else {
    console.log(`✓ Found ${productCount} existing product specifications\n`);
  }

  console.log('✅ Database seeding completed!\n');
  console.log('📝 Test Credentials:');
  console.log('   Email: admin@terraindustries.com');
  console.log('   Password: SecurePass123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

