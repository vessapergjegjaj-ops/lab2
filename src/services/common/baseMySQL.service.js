const validateRequiredFields = (model, data = {}) => {
  const missing = (model.requiredFields || []).filter((field) => {
    const dbField = model.fields[field];
    return data[field] === undefined && data[dbField] === undefined;
  });

  if (missing.length) {
    throw new Error("Missing required fields: " + missing.join(", "));
  }
};

const createBaseMySQLService = (repository) => {
  const { model } = repository;

  return {
    async getAll(options) {
      return await repository.findAll(options);
    },

    async getById(id) {
      return await repository.findById(id);
    },

    async create(data) {
      validateRequiredFields(model, data);
      return await repository.create(data);
    },

    async update(id, data) {
      return await repository.update(id, data);
    },

    async delete(id) {
      return await repository.delete(id);
    },
  };
};

module.exports = createBaseMySQLService;
