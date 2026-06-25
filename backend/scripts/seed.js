const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const University = require('../models/University');
const Professor = require('../models/Professor');
const Document = require('../models/Document');
const Recommender = require('../models/Recommender');
const LorStatus = require('../models/LorStatus');
const SopDraft = require('../models/SopDraft');
const EmailDraft = require('../models/EmailDraft');
const Coordinator = require('../models/Coordinator');
const Reminder = require('../models/Reminder');
const Requirement = require('../models/Requirement');

dotenv.config();

const universityNames = [
  'Massachusetts Institute of Technology',
  'Stanford University',
  'University of Toronto',
];

const documentTitles = [
  'MIT SOP - AI Systems Draft',
  'Stanford Research CV',
  'IELTS Academic Score Report',
  'University of Toronto Transcript Packet',
  'Funding Essay - Human-Centered AI',
];

const recommenderEmails = [
  'farhana.akter@example.edu',
  'kamal.hossain@example.edu',
  'sadia.rahman@example.edu',
];

const professorEmails = [
  'ana.mitchell@mit.edu',
  'rohan.patel@stanford.edu',
  'meilin.chen@utoronto.ca',
  'sarah.nguyen@mit.edu',
];

const coordinatorEmails = [
  'grad-coord@mit.edu',
  'cs-admissions@stanford.edu',
  'grad.office@utoronto.ca',
];

const reminderTitles = [
  'Send MIT RA follow-up',
  'Finalize Stanford funding essay',
  'Upload Toronto transcript packet',
  'Check LOR status with Dr. Farhana Akter',
];

const requirementTitles = [
  'MIT SOP final version',
  'MIT application fee or waiver',
  'Stanford funding essay',
  'Stanford LOR packet',
  'Toronto transcript upload',
  'Toronto IELTS score report',
];

const demoUser = {
  name: 'Demo Applicant',
  email: 'demo@grad-os.local',
  password: 'password123',
};

const clearSeedData = async () => {
  const user = await User.findOne({ email: demoUser.email });
  const userFilter = user ? { userId: user._id } : {};
  const seededUniversities = await University.find({ name: { $in: universityNames } }).select('_id');
  const seededDocuments = await Document.find({ title: { $in: documentTitles } }).select('_id');
  const seededRecommenders = await Recommender.find({ email: { $in: recommenderEmails } }).select('_id');

  await Promise.all([
    SopDraft.deleteMany({ title: { $regex: 'Seed SOP' } }),
    EmailDraft.deleteMany({ subject: { $regex: 'Seed Email' } }),
    Coordinator.deleteMany({ email: { $in: coordinatorEmails } }),
    Reminder.deleteMany({ title: { $in: reminderTitles } }),
    Requirement.deleteMany({ title: { $in: requirementTitles } }),
    Professor.deleteMany({ email: { $in: professorEmails } }),
    LorStatus.deleteMany({
      $or: [
        { universityId: { $in: seededUniversities.map((university) => university._id) } },
        { recommenderId: { $in: seededRecommenders.map((recommender) => recommender._id) } },
      ],
    }),
  ]);

  await Promise.all([
    University.deleteMany({ name: { $in: universityNames } }),
    Document.deleteMany({ title: { $in: documentTitles } }),
    Recommender.deleteMany({ email: { $in: recommenderEmails } }),
  ]);
};

const seedData = async () => {
  await clearSeedData();

  await User.deleteOne({ email: demoUser.email });
  const user = await User.create(demoUser);

  const universities = await University.insertMany([
    {
      userId: user._id,
      name: 'Massachusetts Institute of Technology',
      applicationDeadline: new Date('2026-12-15'),
      applicationFee: 75,
      feePaid: false,
      feeWaiverStatus: 'Pending',
      ieltsRequiredScore: 7,
      transcriptsSent: false,
      applicationStatus: 'In Progress',
      fundingStatus: 'Eligible',
      fundingType: 'Full Fund',
      scholarshipName: 'EECS Graduate Fellowship',
      assistantshipType: 'RA',
      stipendAmount: 42000,
      tuitionWaiver: true,
      priority: 'High',
      portalUrl: 'https://gradapply.mit.edu',
      notes: 'Strong funding fit through research assistantship labs.',
    },
    {
      userId: user._id,
      name: 'Stanford University',
      applicationDeadline: new Date('2026-12-01'),
      applicationFee: 125,
      feePaid: true,
      feeWaiverStatus: 'N/A',
      ieltsRequiredScore: 7,
      transcriptsSent: true,
      applicationStatus: 'Submitted',
      fundingStatus: 'Applied',
      fundingType: 'Full Fund',
      scholarshipName: 'Knight-Hennessy / Department Funding',
      assistantshipType: 'Fellowship',
      stipendAmount: 48000,
      tuitionWaiver: true,
      priority: 'High',
      portalUrl: 'https://gradadmissions.stanford.edu/applying',
      notes: 'Track fellowship result separately from department admission.',
    },
    {
      userId: user._id,
      name: 'University of Toronto',
      applicationDeadline: new Date('2027-01-10'),
      applicationFee: 120,
      feePaid: false,
      feeWaiverStatus: 'Approved',
      ieltsRequiredScore: 6.5,
      transcriptsSent: false,
      applicationStatus: 'Planning',
      fundingStatus: 'Researching',
      fundingType: 'Partial Fund',
      scholarshipName: 'International Doctoral Award',
      assistantshipType: 'TA',
      stipendAmount: 28000,
      tuitionWaiver: true,
      priority: 'Medium',
      portalUrl: 'https://www.sgs.utoronto.ca/admissions',
      notes: 'Confirm whether first-year funding covers international tuition gap.',
    },
  ]);

  const documents = await Document.insertMany([
    {
      userId: user._id,
      title: 'MIT SOP - AI Systems Draft',
      type: 'SOP',
      fileUrl: 'https://example.com/documents/mit-sop-ai-systems.pdf',
      tags: ['mit', 'sop', 'ai-systems'],
      uploadDate: new Date('2026-06-10'),
    },
    {
      userId: user._id,
      title: 'Stanford Research CV',
      type: 'CV',
      fileUrl: 'https://example.com/documents/stanford-research-cv.pdf',
      tags: ['cv', 'research', 'stanford'],
      uploadDate: new Date('2026-06-12'),
    },
    {
      userId: user._id,
      title: 'IELTS Academic Score Report',
      type: 'IELTS',
      fileUrl: 'https://example.com/documents/ielts-score-report.pdf',
      tags: ['ielts', 'official'],
      uploadDate: new Date('2026-06-14'),
    },
    {
      userId: user._id,
      title: 'University of Toronto Transcript Packet',
      type: 'Transcript',
      fileUrl: 'https://example.com/documents/utoronto-transcript-packet.pdf',
      tags: ['transcript', 'utoronto'],
      uploadDate: new Date('2026-06-15'),
    },
    {
      userId: user._id,
      title: 'Funding Essay - Human-Centered AI',
      type: 'Essay',
      fileUrl: 'https://example.com/documents/funding-essay-human-centered-ai.pdf',
      tags: ['funding', 'essay', 'ai'],
      uploadDate: new Date('2026-06-17'),
    },
  ]);

  const recommenders = await Recommender.insertMany([
    {
      userId: user._id,
      name: 'Dr. Farhana Akter',
      email: 'farhana.akter@example.edu',
      role: 'Thesis Supervisor',
      title: 'Associate Professor',
    },
    {
      userId: user._id,
      name: 'Dr. Kamal Hossain',
      email: 'kamal.hossain@example.edu',
      role: 'Research Mentor',
      title: 'Professor',
    },
    {
      userId: user._id,
      name: 'Dr. Sadia Rahman',
      email: 'sadia.rahman@example.edu',
      role: 'Course Instructor',
      title: 'Assistant Professor',
    },
  ]);

  const [mit, stanford, toronto] = universities;
  const [mitSop, stanfordCv] = documents;
  const [supervisor, mentor, instructor] = recommenders;

  const professors = await Professor.insertMany([
    {
      userId: user._id,
      name: 'Prof. Ana Mitchell',
      email: 'ana.mitchell@mit.edu',
      universityId: mit._id,
      researchArea: 'Human-centered artificial intelligence',
      outreachStatus: 'Interviewing',
      lastContactedDate: new Date('2026-06-20'),
      assignedSopId: mitSop._id,
      interviewNotes: 'Discussed fit with explainable AI and graduate assistantship options.',
      firstEmailDate: new Date('2026-06-12'),
      followUpDate: new Date('2026-07-01'),
      replyDate: new Date('2026-06-20'),
      replyStatus: 'Positive',
      interestLevel: 'High',
      nextAction: 'Send updated SOP and ask about RA openings.',
      meetingDate: new Date('2026-07-08'),
      replyNotes: 'Positive response; suggested reading two recent lab papers.',
    },
    {
      userId: user._id,
      name: 'Prof. Rohan Patel',
      email: 'rohan.patel@stanford.edu',
      universityId: stanford._id,
      researchArea: 'Distributed machine learning systems',
      outreachStatus: 'Cold Emailed',
      lastContactedDate: new Date('2026-06-18'),
      assignedSopId: stanfordCv._id,
      interviewNotes: '',
      firstEmailDate: new Date('2026-06-18'),
      followUpDate: new Date('2026-07-03'),
      replyStatus: 'No Reply',
      interestLevel: 'Unknown',
      nextAction: 'Send short follow-up with CV attached.',
    },
    {
      userId: user._id,
      name: 'Prof. Meilin Chen',
      email: 'meilin.chen@utoronto.ca',
      universityId: toronto._id,
      researchArea: 'Data visualization and decision support',
      outreachStatus: 'Shortlisted',
      assignedSopId: mitSop._id,
      interviewNotes: 'Potential alignment with visual analytics lab.',
      replyStatus: 'No Reply',
      interestLevel: 'Medium',
      nextAction: 'Draft first outreach email.',
    },
    {
      userId: user._id,
      name: 'Prof. Sarah Nguyen',
      email: 'sarah.nguyen@mit.edu',
      universityId: mit._id,
      researchArea: 'Robust NLP systems',
      outreachStatus: 'Applied',
      lastContactedDate: new Date('2026-06-22'),
      assignedSopId: mitSop._id,
      interviewNotes: 'Application submitted; waiting for department review.',
      firstEmailDate: new Date('2026-06-14'),
      replyDate: new Date('2026-06-22'),
      replyStatus: 'Neutral',
      interestLevel: 'Medium',
      nextAction: 'Wait for department review.',
    },
  ]);

  await LorStatus.insertMany([
    {
      recommenderId: supervisor._id,
      userId: user._id,
      universityId: mit._id,
      isSubmitted: false,
    },
    {
      recommenderId: mentor._id,
      userId: user._id,
      universityId: stanford._id,
      isSubmitted: true,
      submissionDate: new Date('2026-06-21'),
    },
    {
      recommenderId: instructor._id,
      userId: user._id,
      universityId: toronto._id,
      isSubmitted: false,
    },
    {
      recommenderId: supervisor._id,
      userId: user._id,
      universityId: stanford._id,
      isSubmitted: true,
      submissionDate: new Date('2026-06-19'),
    },
  ]);

  const [mitProfessor, stanfordProfessor, torontoProfessor] = professors;

  await SopDraft.insertMany([
    {
      title: 'Seed SOP - MIT AI Systems',
      userId: user._id,
      version: 1,
      universityId: mit._id,
      professorId: mitProfessor._id,
      focusArea: 'Explainable AI and graduate research fit',
      content:
        'Initial SOP draft focused on AI systems background, research goals, and alignment with the lab.',
      changeSummary: 'Initial version with broad research fit.',
      isActive: false,
    },
    {
      title: 'Seed SOP - MIT AI Systems',
      userId: user._id,
      version: 2,
      universityId: mit._id,
      professorId: mitProfessor._id,
      focusArea: 'Human-centered AI with RA funding angle',
      content:
        'Updated SOP draft with clearer faculty alignment, assistantship interest, and project-specific motivation.',
      changeSummary: 'Added funding-fit paragraph and professor-specific research bridge.',
      isActive: true,
    },
    {
      title: 'Seed SOP - Toronto Visual Analytics',
      userId: user._id,
      version: 1,
      universityId: toronto._id,
      professorId: torontoProfessor._id,
      focusArea: 'Visual analytics for decision support',
      content:
        'Draft tailored to data visualization, decision support systems, and partial funding requirements.',
      changeSummary: 'Created Toronto-specific version.',
      isActive: true,
    },
  ]);

  await EmailDraft.insertMany([
    {
      subject: 'Seed Email - MIT RA Inquiry',
      userId: user._id,
      version: 1,
      universityId: mit._id,
      professorId: mitProfessor._id,
      purpose: 'Cold Outreach',
      body:
        'Dear Professor Mitchell, I am interested in your work on human-centered AI and would be grateful to discuss possible RA alignment.',
      changeSummary: 'Initial concise outreach.',
      isActive: false,
    },
    {
      subject: 'Seed Email - MIT RA Inquiry',
      userId: user._id,
      version: 2,
      universityId: mit._id,
      professorId: mitProfessor._id,
      purpose: 'Follow Up',
      body:
        'Dear Professor Mitchell, I wanted to follow up on my earlier note and share a clearer summary of my research fit and funding interest.',
      changeSummary: 'Converted to follow-up version.',
      isActive: true,
    },
    {
      subject: 'Seed Email - Stanford Funding Question',
      userId: user._id,
      version: 1,
      universityId: stanford._id,
      professorId: stanfordProfessor._id,
      purpose: 'Funding Inquiry',
      body:
        'Dear Graduate Admissions Team, I am writing to confirm how fellowship review aligns with departmental funding consideration.',
      changeSummary: 'Coordinator-style funding question.',
      isActive: true,
    },
  ]);

  await Coordinator.insertMany([
    {
      name: 'Maya Thompson',
      userId: user._id,
      email: 'grad-coord@mit.edu',
      title: 'Graduate Program Coordinator',
      department: 'EECS',
      universityId: mit._id,
      phone: '+1 617 555 0198',
      notes: 'Ask about RA matching timeline and IELTS waiver policy.',
      lastContactedDate: new Date('2026-06-20'),
    },
    {
      name: 'Evan Brooks',
      userId: user._id,
      email: 'cs-admissions@stanford.edu',
      title: 'Admissions Coordinator',
      department: 'Computer Science',
      universityId: stanford._id,
      notes: 'Clarify fellowship and department funding review sequence.',
      lastContactedDate: new Date('2026-06-18'),
    },
    {
      name: 'Priya Shah',
      userId: user._id,
      email: 'grad.office@utoronto.ca',
      title: 'Graduate Office Contact',
      department: 'Computer Science',
      universityId: toronto._id,
      notes: 'Confirm international tuition coverage details.',
    },
  ]);

  await Reminder.insertMany([
    {
      title: 'Send MIT RA follow-up',
      userId: user._id,
      dueDate: new Date('2026-07-01'),
      category: 'Email',
      priority: 'High',
      universityId: mit._id,
      professorId: mitProfessor._id,
      notes: 'Attach updated CV and mention SOP version 2.',
    },
    {
      title: 'Finalize Stanford funding essay',
      userId: user._id,
      dueDate: new Date('2026-07-05'),
      category: 'Funding',
      priority: 'High',
      universityId: stanford._id,
      notes: 'Polish fellowship narrative and leadership section.',
    },
    {
      title: 'Upload Toronto transcript packet',
      userId: user._id,
      dueDate: new Date('2026-07-09'),
      category: 'Document',
      priority: 'Medium',
      universityId: toronto._id,
      notes: 'Use official transcript PDF from document vault.',
    },
    {
      title: 'Check LOR status with Dr. Farhana Akter',
      userId: user._id,
      dueDate: new Date('2026-07-12'),
      category: 'LOR',
      priority: 'Medium',
      universityId: mit._id,
      notes: 'Send a polite reminder only if portal still shows pending.',
    },
  ]);

  await Requirement.insertMany([
    {
      title: 'MIT SOP final version',
      userId: user._id,
      universityId: mit._id,
      documentId: mitSop._id,
      type: 'SOP',
      status: 'In Progress',
      priority: 'High',
      dueDate: new Date('2026-11-25'),
      notes: 'Use professor-specific version after reply from Prof. Mitchell.',
    },
    {
      title: 'MIT application fee or waiver',
      userId: user._id,
      universityId: mit._id,
      type: 'Fee Waiver',
      status: 'In Progress',
      priority: 'High',
      dueDate: new Date('2026-11-20'),
      notes: 'Fee waiver currently pending.',
    },
    {
      title: 'Stanford funding essay',
      userId: user._id,
      universityId: stanford._id,
      type: 'Essay',
      status: 'Ready',
      priority: 'High',
      dueDate: new Date('2026-11-15'),
      notes: 'Final review for fellowship narrative.',
    },
    {
      title: 'Stanford LOR packet',
      userId: user._id,
      universityId: stanford._id,
      type: 'LOR',
      status: 'Submitted',
      priority: 'High',
      dueDate: new Date('2026-11-28'),
      notes: 'Two recommendations submitted; monitor final portal status.',
    },
    {
      title: 'Toronto transcript upload',
      userId: user._id,
      universityId: toronto._id,
      documentId: documents[3]._id,
      type: 'Transcript',
      status: 'Not Started',
      priority: 'Medium',
      dueDate: new Date('2026-12-18'),
      notes: 'Confirm unofficial transcript upload format.',
    },
    {
      title: 'Toronto IELTS score report',
      userId: user._id,
      universityId: toronto._id,
      documentId: documents[2]._id,
      type: 'IELTS',
      status: 'Ready',
      priority: 'Medium',
      dueDate: new Date('2026-12-20'),
      notes: 'Score meets minimum requirement.',
    },
  ]);

  return {
    universities: universities.length,
    users: 1,
    documents: documents.length,
    recommenders: recommenders.length,
    professors: professorEmails.length,
    lorStatuses: 4,
    sopDrafts: 3,
    emailDrafts: 3,
    coordinators: 3,
    reminders: 4,
    requirements: 6,
  };
};

const run = async () => {
  try {
    await connectDB();
    const counts = await seedData();
    console.log('Seed data inserted:', counts);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
