const verifyDepartamento = (req, res, next) => {
  const userDepartamentoId = req.user.departamento_id; 
  const paramId = parseInt(req.params.id);

  // Se tentar acessar outro departamento
  if (paramId !== userDepartamentoId) {
    return res.status(403).json({ mensagem: "Acesso negado: departamento não autorizado" });
  }

  next();
};

export default verifyDepartamento;
