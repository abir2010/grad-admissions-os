const dotenv = require('dotenv');

dotenv.config();

const API_BASE_URL = `http://127.0.0.1:${process.env.PORT || 5000}/api`;
let authToken = '';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${text}`);
  }

  return data;
};

const post = (path, body) =>
  request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });

const patch = (path, body) =>
  request(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

const del = (path) => request(path, { method: 'DELETE' });

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const cleanup = async (created) => {
  const deleteSteps = [
    ['/reminders', created.reminder],
    ['/requirements', created.requirement],
    ['/coordinators', created.coordinator],
    ['/email-drafts', created.emailDraft],
    ['/sop-drafts', created.sopDraft],
    ['/lor-statuses', created.lorStatus],
    ['/professors', created.professor],
    ['/documents', created.document],
    ['/recommenders', created.recommender],
    ['/universities', created.university],
  ];

  for (const [path, id] of deleteSteps) {
    if (id) {
      await del(`${path}/${id}`);
    }
  }
};

const run = async () => {
  const created = {};

  try {
    const health = await request('/health');
    assert(health.status === 'ok', 'Health check did not return ok');

    const routeIndex = await request('');
    assert(routeIndex.routes.universities === '/api/universities', 'Route index is missing universities');
    assert(routeIndex.routes.sopDrafts === '/api/sop-drafts', 'Route index is missing SOP drafts');

    const login = await post('/auth/login', {
      email: 'demo@grad-os.local',
      password: 'password123',
    });
    authToken = login.token;
    assert(Boolean(authToken), 'Login did not return a token');

    const seededUniversities = await request('/universities');
    const seededDocuments = await request('/documents');
    const seededRecommenders = await request('/recommenders');
    const seededProfessors = await request('/professors');
    const seededLorStatuses = await request('/lor-statuses');
    const seededSopDrafts = await request('/sop-drafts');
    const seededEmailDrafts = await request('/email-drafts');
    const seededCoordinators = await request('/coordinators');
    const seededReminders = await request('/reminders');
    const seededRequirements = await request('/requirements');

    assert(seededUniversities.length >= 3, 'Expected at least 3 seeded universities');
    assert(seededDocuments.length >= 5, 'Expected at least 5 seeded documents');
    assert(seededRecommenders.length >= 3, 'Expected at least 3 seeded recommenders');
    assert(seededProfessors.length >= 4, 'Expected at least 4 seeded professors');
    assert(seededLorStatuses.length >= 4, 'Expected at least 4 seeded LOR statuses');
    assert(seededSopDrafts.length >= 3, 'Expected at least 3 seeded SOP drafts');
    assert(seededEmailDrafts.length >= 3, 'Expected at least 3 seeded email drafts');
    assert(seededCoordinators.length >= 3, 'Expected at least 3 seeded coordinators');
    assert(seededReminders.length >= 4, 'Expected at least 4 seeded reminders');
    assert(seededRequirements.length >= 6, 'Expected at least 6 seeded requirements');

    const university = await post('/universities', {
      name: 'Smoke Test University',
      applicationDeadline: '2027-02-01',
      applicationFee: 90,
      feePaid: false,
      feeWaiverStatus: 'Pending',
      ieltsRequiredScore: 7,
      transcriptsSent: false,
    });
    created.university = university._id;

    const document = await post('/documents', {
      title: 'Smoke Test SOP',
      type: 'SOP',
      fileUrl: 'https://example.com/smoke-test-sop.pdf',
      tags: ['smoke-test', 'sop'],
    });
    created.document = document._id;

    const recommender = await post('/recommenders', {
      name: 'Dr. Smoke Tester',
      email: 'smoke.tester@example.edu',
      role: 'Test Recommender',
      title: 'Professor',
    });
    created.recommender = recommender._id;

    const professor = await post('/professors', {
      name: 'Prof. Smoke Pipeline',
      email: 'smoke.pipeline@example.edu',
      universityId: university._id,
      researchArea: 'Backend integration testing',
      outreachStatus: 'Shortlisted',
      assignedSopId: document._id,
      interviewNotes: 'Temporary smoke-test professor.',
    });
    created.professor = professor._id;
    assert(professor.universityId.name === 'Smoke Test University', 'Professor university was not populated');
    assert(professor.assignedSopId.title === 'Smoke Test SOP', 'Professor document was not populated');

    const lorStatus = await post('/lor-statuses', {
      recommenderId: recommender._id,
      universityId: university._id,
      isSubmitted: false,
    });
    created.lorStatus = lorStatus._id;
    assert(lorStatus.recommenderId.email === 'smoke.tester@example.edu', 'LOR recommender was not populated');
    assert(lorStatus.universityId.name === 'Smoke Test University', 'LOR university was not populated');

    const sopDraft = await post('/sop-drafts', {
      title: 'Smoke Test SOP Versioned',
      universityId: university._id,
      professorId: professor._id,
      focusArea: 'Smoke testing versioned SOPs',
      content: 'Temporary SOP draft content.',
      changeSummary: 'Initial smoke-test version.',
    });
    created.sopDraft = sopDraft._id;
    assert(sopDraft.version === 1, 'SOP draft version was not assigned');

    const emailDraft = await post('/email-drafts', {
      subject: 'Smoke Test Email Versioned',
      universityId: university._id,
      professorId: professor._id,
      purpose: 'Funding Inquiry',
      body: 'Temporary email draft body.',
      changeSummary: 'Initial smoke-test version.',
    });
    created.emailDraft = emailDraft._id;
    assert(emailDraft.version === 1, 'Email draft version was not assigned');

    const coordinator = await post('/coordinators', {
      name: 'Smoke Coordinator',
      email: 'smoke.coordinator@example.edu',
      title: 'Graduate Coordinator',
      department: 'Computer Science',
      universityId: university._id,
      notes: 'Temporary coordinator.',
    });
    created.coordinator = coordinator._id;
    assert(coordinator.universityId.name === 'Smoke Test University', 'Coordinator university was not populated');

    const reminder = await post('/reminders', {
      title: 'Smoke Test Reminder',
      dueDate: '2027-01-15',
      category: 'Funding',
      priority: 'High',
      universityId: university._id,
      professorId: professor._id,
      notes: 'Temporary reminder.',
    });
    created.reminder = reminder._id;
    assert(reminder.universityId.name === 'Smoke Test University', 'Reminder university was not populated');

    const requirement = await post('/requirements', {
      title: 'Smoke Test Requirement',
      universityId: university._id,
      documentId: document._id,
      type: 'SOP',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2027-01-20',
      notes: 'Temporary requirement.',
    });
    created.requirement = requirement._id;
    assert(requirement.universityId.name === 'Smoke Test University', 'Requirement university was not populated');
    assert(requirement.documentId.title === 'Smoke Test SOP', 'Requirement document was not populated');

    const updatedUniversity = await patch(`/universities/${university._id}`, { feePaid: true });
    const updatedDocument = await patch(`/documents/${document._id}`, { tags: ['smoke-test', 'updated'] });
    const updatedRecommender = await patch(`/recommenders/${recommender._id}`, { role: 'Updated Role' });
    const updatedProfessor = await patch(`/professors/${professor._id}`, {
      outreachStatus: 'Interviewing',
      lastContactedDate: '2026-06-25',
    });
    const updatedLorStatus = await patch(`/lor-statuses/${lorStatus._id}`, {
      isSubmitted: true,
      submissionDate: '2026-06-25',
    });
    const updatedSopDraft = await patch(`/sop-drafts/${sopDraft._id}`, { changeSummary: 'Updated SOP version.' });
    const updatedEmailDraft = await patch(`/email-drafts/${emailDraft._id}`, { changeSummary: 'Updated email version.' });
    const updatedCoordinator = await patch(`/coordinators/${coordinator._id}`, { phone: '+1 555 0100' });
    const updatedReminder = await patch(`/reminders/${reminder._id}`, { completed: true });
    const updatedRequirement = await patch(`/requirements/${requirement._id}`, { status: 'Submitted' });

    assert(updatedUniversity.feePaid === true, 'University update failed');
    assert(updatedDocument.tags.includes('updated'), 'Document update failed');
    assert(updatedRecommender.role === 'Updated Role', 'Recommender update failed');
    assert(updatedProfessor.outreachStatus === 'Interviewing', 'Professor update failed');
    assert(updatedLorStatus.isSubmitted === true, 'LOR status update failed');
    assert(updatedSopDraft.changeSummary === 'Updated SOP version.', 'SOP draft update failed');
    assert(updatedEmailDraft.changeSummary === 'Updated email version.', 'Email draft update failed');
    assert(updatedCoordinator.phone === '+1 555 0100', 'Coordinator update failed');
    assert(updatedReminder.completed === true, 'Reminder update failed');
    assert(updatedRequirement.status === 'Submitted', 'Requirement update failed');

    const filteredProfessors = await request('/professors?status=Interviewing');
    const filteredDocuments = await request('/documents?type=SOP');
    const filteredLorStatuses = await request('/lor-statuses?isSubmitted=true');
    const filteredReminders = await request('/reminders?completed=true');
    const filteredRequirements = await request('/requirements?status=Submitted');

    assert(
      filteredProfessors.some((item) => item._id === professor._id),
      'Professor status filter failed'
    );
    assert(filteredDocuments.some((item) => item._id === document._id), 'Document type filter failed');
    assert(
      filteredLorStatuses.some((item) => item._id === lorStatus._id),
      'LOR submitted filter failed'
    );
    assert(filteredReminders.some((item) => item._id === reminder._id), 'Reminder completed filter failed');
    assert(
      filteredRequirements.some((item) => item._id === requirement._id),
      'Requirement status filter failed'
    );

    await cleanup(created);

    const deletedDocumentCheck = await request(`/documents/${document._id}`).catch((error) => error);
    assert(
      deletedDocumentCheck instanceof Error && deletedDocumentCheck.message.includes('404'),
      'Delete verification failed'
    );

    console.log('API smoke tests passed.');
    console.log('Seeded baseline counts:', {
      universities: seededUniversities.length,
      documents: seededDocuments.length,
      recommenders: seededRecommenders.length,
      professors: seededProfessors.length,
      lorStatuses: seededLorStatuses.length,
      sopDrafts: seededSopDrafts.length,
      emailDrafts: seededEmailDrafts.length,
      coordinators: seededCoordinators.length,
      reminders: seededReminders.length,
      requirements: seededRequirements.length,
    });
  } catch (error) {
    await cleanup(created).catch(() => {});
    console.error(`API smoke tests failed: ${error.message}`);
    process.exitCode = 1;
  }
};

run();
