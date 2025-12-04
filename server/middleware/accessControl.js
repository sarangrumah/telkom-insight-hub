const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * Middleware to check if user's company is verified
 */
const requireVerifiedCompany = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    // Check if user is an admin (they bypass verification requirements)
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['super_admin', 'internal_admin', 'pengolah_data'])
      .single();

    if (roleError && roleError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw roleError;
    }

    if (userRoles) {
      req.user = user;
      req.isAdmin = true;
      req.userRole = userRoles.role;
      return next();
    }

    // Check company verification status for non-admin users
    const { data: userCompany, error: companyError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (companyError || !userCompany) {
      return res.status(403).json({ 
        error: 'User does not belong to any company',
        access_level: 'none',
        message: 'You must be associated with a company to access this resource'
      });
    }

    const { data: company, error: companyStatusError } = await supabase
      .from('companies')
      .select('status, verification_notes, correction_notes')
      .eq('id', userCompany.company_id)
      .single();

    if (companyStatusError) throw companyStatusError;

    if (!company) {
      return res.status(403).json({ 
        error: 'Company not found',
        access_level: 'none',
        message: 'Associated company not found'
      });
    }

    req.user = user;
    req.companyId = userCompany.company_id;
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
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError) throw authError;

      // Check if user is an admin (they have full access)
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['super_admin', 'internal_admin', 'pengolah_data'])
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        throw roleError;
      }

      if (userRoles) {
        req.user = user;
        req.isAdmin = true;
        req.userRole = userRoles.role;
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
      const { data: userCompany, error: companyError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (companyError || !userCompany) {
        return res.status(403).json({ 
          error: 'User does not belong to any company',
          access_level: 'none',
          message: 'You must be associated with a company to access this resource'
        });
      }

      const { data: company, error: companyStatusError } = await supabase
        .from('companies')
        .select('status')
        .eq('id', userCompany.company_id)
        .single();

      if (companyStatusError) throw companyStatusError;

      if (!company) {
        return res.status(403).json({ 
          error: 'Company not found',
          access_level: 'none',
          message: 'Associated company not found'
        });
      }

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

      req.user = user;
      req.companyId = userCompany.company_id;
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
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    const companyId = req.params.companyId || req.body.companyId;

    // Check if user has access to the company
    const { data: userCompanies, error: accessError } = await supabase
      .from('user_profiles')
      .select('company_id, is_company_admin')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single();

    if (accessError || !userCompanies) {
      return res.status(403).json({ error: 'Unauthorized access to company' });
    }

    // Check company verification status
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('status')
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    // Set access level based on company status and user role
    let accessLevel = 'none';
    let canAccess = false;

    // Check if user is an admin
    const { data: adminRoles, error: adminError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['super_admin', 'internal_admin', 'pengolah_data']);

    if (adminRoles && adminRoles.length > 0) {
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

    req.user = user;
    req.companyId = companyId;
    req.companyStatus = company.status;
    req.isCompanyAdmin = userCompanies.is_company_admin;
    req.accessLevel = accessLevel;
    req.isAdmin = adminRoles && adminRoles.length > 0;
    
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
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError) throw authError;

      // Check if user has required role
      const { data, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', roles)
        .single();

      if (roleError || !data) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required_roles: roles,
          message: 'You do not have the required role to access this resource'
        });
      }

      req.user = user;
      req.userRole = data.role;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = {
  requireVerifiedCompany,
  checkAccessLevel,
  requireCompanyAccess,
  requireRole
};