const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Post = require('./models/Post');
const auth = require('./middlewares/authMiddleware');

const router = express.Router();

// === Регистрация ==
router.post('/register',async(req,res)=>{
  try{
  const {username,email,password} = req.body;

  if(!username || !email || !password){
    return res.status(400).json('error: Заполните поле')
  }
  const exits = await User.findOne({email})
    if(exits){
    return res.status(400).json({ message: 'Email уже используется' })
    }
    const hash = await bcrypt.hash(password,10)
    await User.create({username,email,password: hash})
    res.status(201).json({ message: '✅ Регистрация успешна' });
  }catch(err){
 res.status(500).json({ message: 'Ошибка сервера', error: err.message }); 
}
})

// === Авторизация == \\
router.post('/login',async(req,res)=>{
 try{
   const {email,password} = req.body;
   if(!email|| !password){
    return res.status(400).json({error: 'Заполните поле'})
   }
    const user = await User.findOne({email})
     if (!user){
    return res.status(400).json({ message: 'Неверный email или пароль' });
     }
     const examination = await bcrypt.compare(password, user.password)
     if(!examination){
       return res.status(400).json({ message: 'Неверный email или пароль' });
     }
       // создаём токен и в него кладём userId
     const token = jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn: '1d'})
      res.json({ message: '✅ Авторизация успешна', token });
 }catch(err){
   res.status(500).json({ message: 'Ошибка сервера', error: err.message }); 
 }
})

// === Создать пост (только авторизованный) ===
router.post('/posts',async(req,res)=>{
  try{
    const {title,content} = req.body;
    if(!title || !content){
      return res.status(400).json({message: 'Введите заголовок и текст' })
    }
    const post = await Post.create({
      title,
      content,
      userId: req.userId,
    })
      res.status(201).json(post)
  }catch(err){
  res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
})

// === Получить все посты ===
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
});


//Получить пост по ID
router.get('/posts/:id', async (req, res) => {
  try{
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Пост не найден' });
    res.json(post)
  }catch(err){
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
})

//Обновить пост по ID
router.put('/posts/:id', auth, async(req,res)=>{
  try{
    const {title,content} = req.body;
    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      {title, content},
      {new: true}
    )
     if (!updated) return res.status(404).json({ message: 'Пост не найден' });
    res.json(updated);
  }catch(err){
   res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
})

router.delete('/posts/:id',auth,async(req,res)=>{
  try{
    const deleted = await Post.findByIdAndDelete(req.params.id)
   if (!deleted) return res.status(404).json({ message: 'Пост не найден' });
    res.json({ message: '✅ Пост удалён' });
  }catch(err){
    res.status(500).json({ message: 'Ошибка сервера', error: err.message }); 
  }
})

module.exports = router;
