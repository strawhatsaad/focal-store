// File: src/components/AuthButtons.tsx
"use client";

// This component previously held OAuth buttons.
// Since OAuth is removed, this component might no longer be needed.
// If you still use it elsewhere for other auth-related buttons, modify accordingly.
// Otherwise, you can delete this file and remove its import from where it was used (e.g., signin page).

const AuthButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      {/* OAuth buttons removed. Add other auth-related buttons here if needed. */}
      {/* Example:
      <button className="btn btn-secondary">Custom Auth Action</button>
      */}
    </div>
  );
};

export default AuthButtons;
