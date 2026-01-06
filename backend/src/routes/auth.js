const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { z } = require('zod');

// Schema de validação para Registro
const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
});

// Schema de validação para Login
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

// Rota de Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, nome } = registerSchema.parse(req.body);

    // 1. Criar usuário no Auth do Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome } // Metadados do usuário
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // 2. Opcional: Se você usa uma tabela 'profiles' separada, inseriria aqui.
    // O Supabase pode fazer isso automaticamente com Triggers, 
    // ou podemos confiar nos metadados do auth.users por enquanto.

    res.status(201).json({
      message: 'Usuário registrado com sucesso! Verifique seu e-mail.',
      user: data.user,
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
  }
});

// Rota de Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    res.json({
      message: 'Login realizado com sucesso!',
      user: data.user,
      session: data.session,
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});

module.exports = router;