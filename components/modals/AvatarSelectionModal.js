import React from 'react';

const AvatarSelectionModal = ({ 
  showAvatarSelectionModal, 
  setShowAvatarSelectionModal,
  studentForAvatarChange,
  setStudentForAvatarChange,
  handleAvatarChange,
  AVAILABLE_AVATARS
}) => {
  if (!showAvatarSelectionModal || !studentForAvatarChange) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Choose New Avatar for {studentForAvatarChange.firstName}
          </h2>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-96 overflow-y-auto">
            {AVAILABLE_AVATARS.map((avatar) => (
              <div
                key={avatar.path}
                className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
                onClick={() => handleAvatarChange(avatar.base)}
              >
                <img
                  src={avatar.path}
                  alt={avatar.base}
                  className="w-full h-full rounded-lg border-2 border-gray-300 hover:border-blue-500 object-cover shadow-md hover:shadow-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {avatar.base}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                setShowAvatarSelectionModal(false);
                setStudentForAvatarChange(null);
              }}
              className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold shadow-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;