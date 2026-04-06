import { query } from '../db.js';

/**
 * Middleware to check if user's company is verified
 */
const requireVerifiedCompany = async (req, res, next) => {
  try {
    // Check if user is authenticated via JWT in auth middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.sub; // JWT subject is the user ID

    // Check if user is an admin (they bypass verification requirements)
    const adminRoleResult = await query(
      `SELECT role FROM public.user_roles
       WHERE user_id = $1 AND role = ANY($2)`,
      [userId, ['super_admin', 'internal_admin', 'pengolah_data']]
    );

    if (adminRoleResult.rows.length > 0) {
      req.isAdmin = true;
      req.userRole = adminRoleResult.rows[0].role;
      return next();
    }

    // Check company verification status for non-admin users
    const userCompanyResult = await query(
      `SELECT company_id FROM public.user_profiles WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (userCompanyResult.rows.length === 0) {
      return res.status(403).json({
        error: 'User does not belong to any company',
        access_level: 'none',
        message: 'You must be associated with a company to access this resource'
      });
    }

    const companyId = userCompanyResult.rows[0].company_id;

    const companyResult = await query(
      `SELECT status, verification_notes, correction_notes FROM public.companies WHERE id = $1 LIMIT 1`,
      [companyId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(403).json({
        error: 'Company not found',
        access_level: 'none',
        message: 'Associated company not found'
      });
    }

    const company = companyResult.rows[0];

    req.companyId = companyId;
    req.companyStatus = company.status;
    req.isAdmin = false;
    req.userRole = 'pelaku_usaha'; // Default role for non-admin users

    // Determine access level based on company status
    req.accessLevel = {
      can_access_dashboard: ['verified', 'pending_verification', 'needs_correction'].includes(company.status),
      can_submit_data: ['verified', 'needs_correction'].includes(company.status),
      can_submit_certificates: company.status === 'verified',
      can_view_company_data: ['verified', 'pending_verification', 'needs_correction'].includes(company.status),
      can_manage_company: ['verified', 'pending_verification', 'needs_correction'].includes(company.status),
      access_level:
        company.status === 'verified' ? 'full' :
        company.status === 'pending_verification' ? 'limited' :
        company.status === 'needs_correction' ? 'limited' : 'none',
      verification_status: company.status,
      restriction_reason:
        company.status === 'pending_verification' ? 'Company under review, limited access granted' :
        company.status === 'needs_correction' ? 'Company needs correction, please update information' :
        company.status === 'rejected' ? 'Company registration rejected' : null
    };

    next();
  } catch (error) {
    console.error('Access control error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Middleware to check specific access level for actions
 */
const checkAccessLevel = (requiredLevel) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated via JWT in auth middleware
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = req.user.sub; // JWT subject is the user ID

      // Check if user is an admin (they have full access)
      const adminRoleResult = await query(
        `SELECT role FROM public.user_roles
         WHERE user_id = $1 AND role = ANY($2)`,
        [userId, ['super_admin', 'internal_admin', 'pengolah_data']]
      );

      if (adminRoleResult.rows.length > 0) {
        req.isAdmin = true;
        req.userRole = adminRoleResult.rows[0].role;
        req.accessPermissions = {
          can_access_dashboard: true,
          can_submit_data: true,
          can_submit_certificates: true,
          can_view_company_data: true,
          can_manage_company: true,
          access_level: 'admin',
          verification_status: 'verified'
        };
        return next();
      }

      // Get user's company verification status
      const userCompanyResult = await query(
        `SELECT company_id FROM public.user_profiles WHERE user_id = $1 LIMIT 1`,
        [userId]
      );

      if (userCompanyResult.rows.length === 0) {
        return res.status(403).json({
          error: 'User does not belong to any company',
          access_level: 'none',
          message: 'You must be associated with a company to access this resource'
        });
      }

      const companyId = userCompanyResult.rows[0].company_id;

      const companyResult = await query(
        `SELECT status FROM public.companies WHERE id = $1 LIMIT 1`,
        [companyId]
      );

      if (companyResult.rows.length === 0) {
        return res.status(403).json({
          error: 'Company not found',
          access_level: 'none',
          message: 'Associated company not found'
        });
      }

      const company = companyResult.rows[0];

      // Determine access based on required level and company status
      let hasAccess = false;
      let errorMessage = '';

      switch (requiredLevel) {
        case 'dashboard':
          hasAccess = ['verified', 'pending_verification', 'needs_correction'].includes(company.status);
          errorMessage = 'You need to have your company verified or under review to access the dashboard';
          break;
        case 'submit_data':
          hasAccess = ['verified', 'needs_correction'].includes(company.status);
          errorMessage = 'You need to have your company verified to submit data';
          break;
        case 'submit_certificates':
          hasAccess = company.status === 'verified';
          errorMessage = 'You need to have your company verified to submit certificates';
          break;
        case 'manage_company':
          hasAccess = ['verified', 'pending_verification', 'needs_correction'].includes(company.status);
          errorMessage = 'You need to have your company verified to manage company settings';
          break;
        case 'view_company_data':
          hasAccess = ['verified', 'pending_verification', 'needs_correction'].includes(company.status);
          errorMessage = 'You need to have your company verified to view company data';
          break;
        default:
          hasAccess = false;
          errorMessage = 'Invalid access level requested';
      }

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Insufficient access level',
          required_level: requiredLevel,
          current_status: company.status,
          access_level:
            company.status === 'verified' ? 'full' :
            company.status === 'pending_verification' ? 'limited' :
            company.status === 'needs_correction' ? 'limited' : 'none',
          message: errorMessage,
          restriction_reason:
            company.status === 'pending_verification' ? 'Company under review' :
            company.status === 'needs_correction' ? 'Company needs correction' :
            company.status === 'rejected' ? 'Company registration rejected' : 'Company not verified'
        });
      }

      req.companyId = companyId;
      req.companyStatus = company.status;
      req.isAdmin = false;
      req.userRole = 'pelaku_usaha';
      
      req.accessPermissions = {
        can_access_dashboard: ['verified', 'pending_verification', 'needs_correction'].includes(company.status),
        can_submit_data: ['verified', 'needs_correction'].includes(company.status),
        can_submit_certificates: company.status === 'verified',
        can_view_company_data: ['verified', 'pending_verification', 'needs_correction'].includes(company.status),
        can_manage_company: ['verified', 'pending_verification', 'needs_correction'].includes(company.status),
        access_level:
          company.status === 'verified' ? 'full' :
          company.status === 'pending_verification' ? 'limited' :
          company.status === 'needs_correction' ? 'limited' : 'none',
        verification_status: company.status
      };

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

/**
 * Middleware to check company access with verification status
 */
const requireCompanyAccess = async (req, res, next) => {
  try {
    // Check if user is authenticated via JWT in auth middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.sub; // JWT subject is the user ID
    const companyId = req.params.companyId || req.body.companyId;

    // Check if user has access to the company
    const userCompaniesResult = await query(
      `SELECT company_id, is_company_admin FROM public.user_profiles
       WHERE user_id = $1 AND company_id = $2 LIMIT 1`,
      [userId, companyId]
    );

    if (userCompaniesResult.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized access to company' });
    }

    // Check company verification status
    const companyResult = await query(
      `SELECT status FROM public.companies WHERE id = $1 LIMIT 1`,
      [companyId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(403).json({ error: 'Company not found' });
    }

    const company = companyResult.rows[0];

    // Check if user is an admin
    const adminRoleResult = await query(
      `SELECT role FROM public.user_roles
       WHERE user_id = $1 AND role = ANY($2)`,
      [userId, ['super_admin', 'internal_admin', 'pengolah_data']]
    );

    // Set access level based on company status and user role
    let accessLevel = 'none';
    let canAccess = false;

    if (adminRoleResult.rows.length > 0) {
      accessLevel = 'admin';
      canAccess = true;
    } else if (company.status === 'verified') {
      accessLevel = 'full';
      canAccess = true;
    } else if (company.status === 'pending_verification') {
      accessLevel = 'limited';
      // Allow access to view company info but restrict submissions
      canAccess = req.method === 'GET' || req.path.includes('/verification-status');
    } else if (company.status === 'needs_correction') {
      accessLevel = 'limited';
      // Allow access to correct company info
      canAccess = true;
    }

    if (!canAccess) {
      return res.status(403).json({
        error: 'Insufficient company access',
        company_status: company.status,
        access_level: accessLevel,
        message: 'Your company verification status does not allow this action'
      });
    }

    req.companyId = companyId;
    req.companyStatus = company.status;
    req.isCompanyAdmin = userCompaniesResult.rows[0].is_company_admin;
    req.accessLevel = accessLevel;
    req.isAdmin = adminRoleResult.rows.length > 0;
    
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Middleware to check if user has specific role
 */
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated via JWT in auth middleware
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = req.user.sub; // JWT subject is the user ID

      // Check if user has required role
      const roleResult = await query(
        `SELECT role FROM public.user_roles WHERE user_id = $1 AND role = ANY($2) LIMIT 1`,
        [userId, roles]
      );

      if (roleResult.rows.length === 0) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required_roles: roles,
          message: 'You do not have the required role to access this resource'
        });
      }

      req.userRole = roleResult.rows[0].role;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

export {
  requireVerifiedCompany,
  checkAccessLevel,
  requireCompanyAccess,
  requireRole
};