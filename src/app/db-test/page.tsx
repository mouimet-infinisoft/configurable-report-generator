'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentProfile, Profile } from '@/lib/db/profiles';
import { getUserTemplates, createTemplate, Template } from '@/lib/db/templates';
import { getUserReports, createReport, Report } from '@/lib/db/reports';
import { getReportImages, Image } from '@/lib/db/images';
import { User } from '@supabase/supabase-js';

export default function DatabaseTest() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);

          // Get profile
          const profileData = await getCurrentProfile();
          setProfile(profileData);

          // Get templates
          const templatesData = await getUserTemplates();
          setTemplates(templatesData);

          // Get reports
          const reportsData = await getUserReports();
          setReports(reportsData);

          // Get images for the first report if any
          if (reportsData.length > 0) {
            const imagesData = await getReportImages(reportsData[0].id);
            setImages(imagesData);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleCreateTemplate = async () => {
    if (!user) {
      setTestResult({ success: false, message: 'You must be logged in to create a template' });
      return;
    }

    try {
      const { data, error } = await createTemplate({
        name: `Test Template ${Date.now()}`,
        description: 'A test template created from the database test page',
        structure: { sections: [{ title: 'Section 1', content: 'This is a test section' }] },
        owner_id: user.id
      });

      if (error) throw error;

      setTemplates([data, ...templates]);
      setTestResult({ success: true, message: `Template created with ID: ${data.id}` });
    } catch (err) {
      console.error('Error creating template:', err);
      setTestResult({ success: false, message: err instanceof Error ? err.message : 'An unknown error occurred' });
    }
  };

  const handleCreateReport = async () => {
    if (!user) {
      setTestResult({ success: false, message: 'You must be logged in to create a report' });
      return;
    }

    try {
      const { data, error } = await createReport({
        title: `Test Report ${Date.now()}`,
        content: { sections: [{ title: 'Report Section', content: 'This is a test report' }] },
        owner_id: user.id,
        // Use template if available, but it's optional
        template_id: templates.length > 0 ? templates[0].id : undefined
      });

      if (error) throw error;

      setReports([data, ...reports]);
      setTestResult({ success: true, message: `Report created with ID: ${data.id}` });
    } catch (err) {
      console.error('Error creating report:', err);
      setTestResult({ success: false, message: err instanceof Error ? err.message : 'An unknown error occurred' });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Schema Test</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">User</h2>
            {user ? (
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                {JSON.stringify(user, null, 2)}
              </pre>
            ) : (
              <p>Not logged in</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            {profile ? (
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                {JSON.stringify(profile, null, 2)}
              </pre>
            ) : (
              <p>No profile found</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Templates ({templates.length})</h2>
            <button
              onClick={handleCreateTemplate}
              className="px-4 py-2 bg-blue-500 text-white rounded mb-2"
            >
              Create Test Template
            </button>
            {templates.length > 0 ? (
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                {JSON.stringify(templates, null, 2)}
              </pre>
            ) : (
              <p>No templates found</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Reports ({reports.length})</h2>
            <button
              onClick={handleCreateReport}
              className="px-4 py-2 bg-blue-500 text-white rounded mb-2"
              // Templates are optional for reports
            >
              Create Test Report
            </button>
            {reports.length > 0 ? (
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                {JSON.stringify(reports, null, 2)}
              </pre>
            ) : (
              <p>No reports found</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Images ({images.length})</h2>
            {images.length > 0 ? (
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                {JSON.stringify(images, null, 2)}
              </pre>
            ) : (
              <p>No images found</p>
            )}
          </div>

          {testResult && (
            <div className={`p-4 rounded ${testResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <p>{testResult.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
