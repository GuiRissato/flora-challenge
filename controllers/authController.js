const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const getJwtSecret = require('../utils/jwtSecret');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Gera o hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Cria um novo usuário
    const user = await User.create({ name, email, password: hashedPassword });

    if(!user){
      return res.status(204).send({message:"no user register"})
    }
    
    // Gera um token JWT
    const jwtSecret = await getJwtSecret();
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
    
    return res.status(200).json({id: user.id, email: user.email, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(204).json({ message: 'No user' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const jwtSecret = await getJwtSecret();
  const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });

  res.status(200).json({ id: user.id, name: user.name, token: `Bearer ${token}` });
};
