import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image,
  Font
} from '@react-pdf/renderer';

// Register fonts for better typography
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2',
      fontWeight: 'bold',
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 0,
    fontFamily: 'Inter',
  },
  
  // Cover Page Styles
  coverPage: {
    flex: 1,
    backgroundColor: '#dc2626',
    backgroundImage: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  coverHeader: {
    position: 'absolute',
    top: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  logo: {
    width: 120,
    height: 40,
  },
  
  awardBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  awardText: {
    color: '#92400e',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  coverContent: {
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  
  redHatLogo: {
    width: 80,
    height: 80,
    marginBottom: 30,
  },
  
  courseTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 1.2,
  },
  
  courseSubtitle: {
    fontSize: 24,
    color: '#fed7d7',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'normal',
  },
  
  keyHighlights: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 15,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  highlightIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
    backgroundColor: '#10b981',
    borderRadius: 8,
  },
  
  highlightText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  coverFooter: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  
  instituteTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  instituteText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Content Page Styles
  contentPage: {
    flex: 1,
    padding: 40,
  },
  
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#dc2626',
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  
  pageNumber: {
    fontSize: 12,
    color: '#666666',
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    marginTop: 25,
  },
  
  sectionContent: {
    marginBottom: 20,
  },
  
  paragraph: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 1.6,
    marginBottom: 10,
    textAlign: 'justify',
  },
  
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  bullet: {
    width: 4,
    height: 4,
    backgroundColor: '#dc2626',
    borderRadius: 2,
    marginTop: 6,
    marginRight: 10,
  },
  
  bulletText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    lineHeight: 1.5,
  },
  
  // Module Styles
  moduleContainer: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  
  moduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  
  moduleContent: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 1.5,
  },
  
  // Table Styles
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  
  tableHeader: {
    backgroundColor: '#dc2626',
  },
  
  tableHeaderCell: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    padding: 10,
  },
  
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  
  tableCell: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    padding: 10,
  },
  
  tableCellText: {
    fontSize: 11,
    color: '#374151',
  },
  
  // Footer Styles
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  
  footerContact: {
    fontSize: 10,
    color: '#6b7280',
  },
  
  footerWebsite: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: 'bold',
  },
});

const RHCSASyllabusPDF = () => (
  <Document>
    {/* Cover Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.coverPage}>
        {/* Header with Logo and Award */}
        <View style={styles.coverHeader}>
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>
            GRRAS SOLUTIONS
          </Text>
          <View style={styles.awardBadge}>
            <Text style={styles.awardText}>🏆 Best Red Hat Partner Since 2007</Text>
          </View>
        </View>
        
        {/* Main Content */}
        <View style={styles.coverContent}>
          {/* Red Hat Logo Placeholder */}
          <View style={[styles.redHatLogo, { backgroundColor: '#ffffff', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: '#dc2626', fontSize: 16, fontWeight: 'bold' }}>RED HAT</Text>
          </View>
          
          <Text style={styles.courseTitle}>RHCSA</Text>
          <Text style={styles.courseSubtitle}>Red Hat Certified System Administrator</Text>
          
          {/* Key Highlights */}
          <View style={styles.keyHighlights}>
            <View style={styles.highlightRow}>
              <View style={styles.highlightIcon} />
              <Text style={styles.highlightText}>40+ Hours of Hands-on Training</Text>
            </View>
            <View style={styles.highlightRow}>
              <View style={styles.highlightIcon} />
              <Text style={styles.highlightText}>Industry-Recognized Certification</Text>
            </View>
            <View style={styles.highlightRow}>
              <View style={styles.highlightIcon} />
              <Text style={styles.highlightText}>Expert Red Hat Instructors</Text>
            </View>
            <View style={styles.highlightRow}>
              <View style={styles.highlightIcon} />
              <Text style={styles.highlightText}>100% Placement Assistance</Text>
            </View>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.coverFooter}>
          <View style={styles.instituteTag}>
            <Text style={styles.instituteText}>GRRAS Solutions Training Institute</Text>
          </View>
        </View>
      </View>
    </Page>

    {/* Page 2: Course Overview */}
    <Page size="A4" style={styles.page}>
      <View style={styles.contentPage}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Course Overview</Text>
          <Text style={styles.pageNumber}>Page 2</Text>
        </View>
        
        <Text style={styles.sectionTitle}>About RHCSA Certification</Text>
        <Text style={styles.paragraph}>
          The Red Hat Certified System Administrator (RHCSA) certification demonstrates your skills in areas of 
          system administration common across a wide range of environments and deployment scenarios. RHCSA 
          certified professionals can perform the core system administration skills required in Red Hat Enterprise 
          Linux environments.
        </Text>
        
        <Text style={styles.sectionTitle}>Why Choose GRRAS for RHCSA?</Text>
        <View style={styles.bulletPoint}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold' }}>Best Red Hat Partner Since 2007:</Text> Official Red Hat training partner with proven track record
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold' }}>Expert Instructors:</Text> Red Hat Certified professionals with industry experience
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold' }}>Hands-on Labs:</Text> 70% practical training with real-world scenarios
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold' }}>Placement Support:</Text> 95% placement rate with top IT companies
          </Text>
        </View>
        
        <Text style={styles.sectionTitle}>Course Information</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>Course Details</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>Information</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>Duration</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>40 Hours (8 Weeks)</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>Mode</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>Online + Offline</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>Certification</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>Red Hat Certified System Administrator (RHCSA)</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>Prerequisites</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>Basic Linux knowledge recommended</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.pageFooter}>
          <Text style={styles.footerContact}>📞 +91-90019 91227 | ✉️ online@grras.com</Text>
          <Text style={styles.footerWebsite}>www.grras.tech</Text>
        </View>
      </View>
    </Page>

    {/* Page 3: Detailed Syllabus */}
    <Page size="A4" style={styles.page}>
      <View style={styles.contentPage}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Detailed Syllabus</Text>
          <Text style={styles.pageNumber}>Page 3</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Module 1: Introduction to Red Hat Enterprise Linux</Text>
        <View style={styles.moduleContainer}>
          <Text style={styles.moduleTitle}>What You'll Learn:</Text>
          <Text style={styles.moduleContent}>
            • Red Hat Enterprise Linux overview and features{'\n'}
            • Installation and initial setup{'\n'}
            • Understanding Linux file system hierarchy{'\n'}
            • Basic command line operations{'\n'}
            • Getting help and documentation
          </Text>
        </View>
        
        <Text style={styles.sectionTitle}>Module 2: File Management and Permissions</Text>
        <View style={styles.moduleContainer}>
          <Text style={styles.moduleTitle}>Key Topics:</Text>
          <Text style={styles.moduleContent}>
            • File and directory operations{'\n'}
            • File permissions and ownership{'\n'}
            • Access Control Lists (ACLs){'\n'}
            • File linking and archiving{'\n'}
            • Text processing tools
          </Text>
        </View>
        
        <Text style={styles.sectionTitle}>Module 3: User and Group Management</Text>
        <View style={styles.moduleContainer}>
          <Text style={styles.moduleTitle}>Learning Objectives:</Text>
          <Text style={styles.moduleContent}>
            • Creating and managing user accounts{'\n'}
            • Group management and membership{'\n'}
            • Password policies and aging{'\n'}
            • Sudo configuration{'\n'}
            • User environment customization
          </Text>
        </View>
        
        <Text style={styles.sectionTitle}>Module 4: Process and Service Management</Text>
        <View style={styles.moduleContainer}>
          <Text style={styles.moduleTitle}>Practical Skills:</Text>
          <Text style={styles.moduleContent}>
            • Process monitoring and control{'\n'}
            • Systemd service management{'\n'}
            • Job scheduling with cron{'\n'}
            • System logging and log analysis{'\n'}
            • Resource monitoring tools
          </Text>
        </View>
        
        <View style={styles.pageFooter}>
          <Text style={styles.footerContact}>📍 A-81, Singh Bhoomi Khatipura Rd, Jaipur</Text>
          <Text style={styles.footerWebsite}>Best Red Hat Training Partner</Text>
        </View>
      </View>
    </Page>

    {/* Page 4: Advanced Topics & Career Path */}
    <Page size="A4" style={styles.page}>
      <View style={styles.contentPage}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Advanced Topics & Career Path</Text>
          <Text style={styles.pageNumber}>Page 4</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Module 5: Network Configuration</Text>
        <View style={styles.moduleContainer}>
          <Text style={styles.moduleTitle}>Network Skills:</Text>
          <Text style={styles.moduleContent}>
            • Network interface configuration{'\n'}
            • Static and dynamic IP addressing{'\n'}
            • Network troubleshooting tools{'\n'}
            • Firewall configuration with firewalld{'\n'}
            • SSH configuration and security
          </Text>
        </View>
        
        <Text style={styles.sectionTitle}>Module 6: Storage Management</Text>
        <View style={styles.moduleContainer}>
          <Text style={styles.moduleTitle}>Storage Expertise:</Text>
          <Text style={styles.moduleContent}>
            • Disk partitioning and formatting{'\n'}
            • Logical Volume Manager (LVM){'\n'}
            • File system creation and mounting{'\n'}
            • RAID configuration{'\n'}
            • Backup and recovery strategies
          </Text>
        </View>
        
        <Text style={styles.sectionTitle}>Career Opportunities</Text>
        <Text style={styles.paragraph}>
          RHCSA certification opens doors to numerous career opportunities in the rapidly growing Linux 
          ecosystem. Our students have successfully placed in top companies with excellent packages.
        </Text>
        
        <Text style={styles.sectionTitle}>Job Roles After RHCSA:</Text>
        <View style={styles.bulletPoint}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold' }}>Linux System Administrator:</Text> ₹4-8 LPA
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold' }}>DevOps Engineer:</Text> ₹6-12 LPA
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold' }}>Cloud Infrastructure Engineer:</Text> ₹8-15 LPA
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold' }}>Site Reliability Engineer:</Text> ₹10-20 LPA
          </Text>
        </View>
        
        <Text style={styles.sectionTitle}>Next Steps</Text>
        <Text style={styles.paragraph}>
          Ready to start your RHCSA journey? Contact us today for admission details, batch schedules, 
          and fee structure. Our admission counselors will guide you through the entire process.
        </Text>
        
        <View style={[styles.keyHighlights, { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#f59e0b' }]}>
          <Text style={[styles.highlightText, { color: '#92400e', textAlign: 'center', fontSize: 16 }]}>
            🎯 Limited Seats Available - Enroll Now!
          </Text>
        </View>
        
        <View style={styles.pageFooter}>
          <Text style={styles.footerContact}>WhatsApp: +91-90019 91227</Text>
          <Text style={styles.footerWebsite}>Download More Syllabi at www.grras.tech</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default RHCSASyllabusPDF;