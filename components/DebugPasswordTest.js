// components/DebugPasswordTest.js - TEMPORARY DEBUG COMPONENT
import React, { useState } from 'react';

const DebugPasswordTest = ({ students, currentClassData }) => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const testStudentPassword = async (student, password) => {
    try {
      const response = await fetch('/api/verify-student-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: student.id,
          password: password,
          classCode: currentClassData?.classCode,
          architectureVersion: 'unknown'
        }),
      });

      const result = await response.json();
      
      return {
        student: student.firstName,
        password: password,
        success: response.ok,
        status: response.status,
        message: result.message || result.error || 'No message',
        result: result
      };
    } catch (error) {
      return {
        student: student.firstName,
        password: password,
        success: false,
        status: 'Network Error',
        message: error.message,
        result: null
      };
    }
  };

  const runPasswordTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    const results = [];
    
    for (const student of students.slice(0, 3)) { // Test first 3 students
      // Test default password format
      const defaultPassword = (student.firstName || 'student').toLowerCase() + '123';
      
      console.log(`Testing ${student.firstName} with password: ${defaultPassword}`);
      
      const result = await testStudentPassword(student, defaultPassword);
      results.push(result);
      
      // Also test the password shown in the teacher interface if different
      if (student.passwordHash) {
        const customResult = await testStudentPassword(student, 'custom_test');
        results.push({
          ...customResult,
          password: 'custom_test (should fail)'
        });
      }
    }
    
    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h4 className="font-semibold text-yellow-800 mb-4">🐛 Password Debug Tool</h4>
      <p className="text-sm text-yellow-700 mb-4">
        This tool tests if the password API is working correctly. Click below to test student logins.
      </p>
      
      <button
        onClick={runPasswordTests}
        disabled={testing || students.length === 0}
        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 mb-4"
      >
        {testing ? 'Testing...' : 'Test Password API'}
      </button>

      {testResults.length > 0 && (
        <div className="mt-4">
          <h5 className="font-medium mb-2">Test Results:</h5>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded border text-sm ${
                  result.success 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : 'bg-red-100 border-red-300 text-red-800'
                }`}
              >
                <div className="font-medium">
                  {result.student} with "{result.password}"
                </div>
                <div>
                  Status: {result.status} | {result.success ? '✅ Success' : '❌ Failed'}
                </div>
                <div>
                  Message: {result.message}
                </div>
                {result.result && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Show full response</summary>
                    <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600">
        <p><strong>Expected behavior:</strong></p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Default passwords should be: firstname + "123" (e.g., "frank123")</li>
          <li>All tests should return Status: 200 and ✅ Success</li>
          <li>Custom password tests should fail with Status: 401</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugPasswordTest;