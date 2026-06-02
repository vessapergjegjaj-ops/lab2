const roleMySQLService = require("../../services/roles/roleMySQL.service");
const permissionMySQLService = require("../../services/permissions/permissionMySQL.service");
const userRoleMySQLService = require("../../services/userRoles/userRoleMySQL.service");

const requestActor = (req) => ({
  userId: req.user ? req.user.id : null,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

const roleMySQLController = {
  async getAllRoles(req, res) {
    try {
      const roles = await roleMySQLService.getAll();
      res.json({ success: true, data: roles });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getRoleById(req, res) {
    try {
      const role = await roleMySQLService.getById(req.params.id);
      if (!role) {
        return res.status(404).json({ success: false, error: "Role not found" });
      }
      res.json({ success: true, data: role });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createRole(req, res) {
    try {
      const role = await roleMySQLService.create(req.body, requestActor(req));
      res.status(201).json({ success: true, data: role });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateRole(req, res) {
    try {
      const role = await roleMySQLService.update(req.params.id, req.body);
      if (!role) {
        return res.status(404).json({ success: false, error: "Role not found" });
      }
      res.json({ success: true, data: role });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async deleteRole(req, res) {
    try {
      const deleted = await roleMySQLService.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Role not found" });
      }
      res.json({ success: true, message: "Role deleted" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getAllPermissions(req, res) {
    try {
      const permissions = await permissionMySQLService.getAll();
      res.json({ success: true, data: permissions });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createPermission(req, res) {
    try {
      const permission = await permissionMySQLService.create(req.body);
      res.status(201).json({ success: true, data: permission });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async getRolePermissions(req, res) {
    try {
      const permissions = await roleMySQLService.getPermissions(req.params.id);
      res.json({ success: true, data: permissions });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async assignPermission(req, res) {
    try {
      const permissions = await roleMySQLService.assignPermission(
        req.params.id,
        req.body.permissionId,
        requestActor(req)
      );
      res.json({ success: true, data: permissions });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async removePermission(req, res) {
    try {
      const removed = await roleMySQLService.removePermission(
        req.params.id,
        req.params.permissionId,
        requestActor(req)
      );
      res.json({ success: true, data: { removed } });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async getUserRoles(req, res) {
    try {
      const roles = await userRoleMySQLService.getUserRoles(req.params.userId);
      res.json({ success: true, data: roles });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async assignUserRole(req, res) {
    try {
      const userRole = await userRoleMySQLService.assignRole(
        req.params.userId,
        req.body.roleId,
        requestActor(req)
      );
      res.status(201).json({ success: true, data: userRole });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async removeUserRole(req, res) {
    try {
      const removed = await userRoleMySQLService.removeRole(
        req.params.userId,
        req.params.roleId,
        requestActor(req)
      );
      res.json({ success: true, data: { removed } });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

module.exports = roleMySQLController;
