import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

type WorkspaceRole = 'owner' | 'admin' | 'member';

interface PermissionGateProps {
    children: React.ReactNode;
    roles?: WorkspaceRole[];
    fallback?: React.ReactNode;
}

/**
 * A wrapper component that conditionally renders its children based on the user's
 * current role in the active workspace.
 * 
 * @param roles - An array of roles allowed to see the children. If omitted, children are shown.
 * @param fallback - Optional component to show if the user doesn't have the required role.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
    children,
    roles,
    fallback = null
}) => {
    const { activeWorkspace } = useWorkspaceStore();

    if (!activeWorkspace) {
        return <>{fallback}</>;
    }

    const userRole = activeWorkspace.role;

    // Check if the user's role is included in the allowed roles
    const hasPermission = !roles || roles.includes(userRole);

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

/**
 * Utility function to check permissions programmatically outside of JSX.
 */
export const checkPermission = (currentRole: WorkspaceRole, allowedRoles: WorkspaceRole[]) => {
    return allowedRoles.includes(currentRole);
};
