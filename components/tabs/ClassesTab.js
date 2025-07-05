import React from 'react';

const ClassesTab = ({
  newClassName,
  setNewClassName,
  newClassStudents,
  setNewClassStudents,
  handleClassImport,
  savingData,
  teacherClasses,
  loadClass
}) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
        <span className="text-3xl mr-3">📚</span>
        My Classes
      </h2>

      <div className="bg-gray-50 p-8 rounded-xl mb-8">
        <h3 className="text-xl font-bold mb-6 text-gray-700">📘 Import New Class</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block mb-3 font-semibold text-gray-700">Class Name</label>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. Year 5 Gold"
              className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block mb-3 font-semibold text-gray-700">Student Names (one per line)</label>
            <textarea
              value={newClassStudents}
              onChange={(e) => setNewClassStudents(e.target.value)}
              rows="6"
              placeholder="Enter one student name per line:&#10;John Smith&#10;Emma Johnson&#10;Michael Brown&#10;Sarah Wilson&#10;David Lee"
              className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleClassImport}
          disabled={savingData}
          className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center space-x-2"
        >
          {savingData ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Importing...</span>
            </>
          ) : (
            <>
              <span>📤</span>
              <span>Import Class</span>
            </>
          )}
        </button>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-6 text-gray-700 flex items-center">
          <span className="text-xl mr-2">📂</span>
          Your Saved Classes
        </h3>
        
        {teacherClasses.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4">📚</div>
            <h4 className="text-xl font-semibold text-gray-600 mb-2">No classes saved yet</h4>
            <p className="text-gray-500">Import your first class above to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherClasses.map((cls) => (
              <div key={cls.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{cls.name}</h4>
                  <p className="text-gray-600 flex items-center">
                    <span className="mr-2">👥</span>
                    {cls.students.length} students
                  </p>
                </div>
                <button
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
                  onClick={() => loadClass(cls)}
                >
                  Load Class
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesTab;