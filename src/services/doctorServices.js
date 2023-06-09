import bcrypt from 'bcrypt';
import doctorRepositories from '../repositories/doctorRepositories.js';
import jwt from 'jsonwebtoken';
import errors from '../errors/index.js'
import "dotenv/config"

async function create({name, email, password, specialty, location}){
    const {rowsCount} = await doctorRepositories.findByEmail(email) //verifica se esse email já está cadastrado
    if(rowsCount) throw errors.duplicatedEmailError(email);

    const hashPassword = await bcrypt.hash(password, 10);
    await doctorRepositories.create({name, email, password: hashPassword, specialty, location});
}

async function signin({email, password}){
    const {rowCount, rows: [user]} = await doctorRepositories.findByEmail(email) //verifica se esse email existe no banco
    if(!rowCount) throw errors.invalidCredentialsError();

    const validPassword = await bcrypt.compare(password, user.password);
    if(!validPassword) throw errors.invalidCredentialsError();

    const token = jwt.sign({id: user.id}, process.env.SECRET_JWT, {expiresIn: 86400}); //a chave secreta é um hash SHA1

    return token;
}

async function getAll(){
    const { rows, rowCount } = await doctorRepositories.getAll();
    if(!rowCount) throw errors.notFoundError();
    return rows;
}

async function searchSpecialty(specialty){
    const { rows, rowCount } = await doctorRepositories.getSpecialties(specialty);
    if(!rowCount) throw errors.notFoundError();
    return rows;
}

async function searchLocation(location){
    const { rows, rowCount } = await doctorRepositories.getOptions(location);
    if(!rowCount) throw errors.notFoundError();
    return rows;
}

export default {
    create,
    signin,
    getAll,
    searchSpecialty,
    searchLocation
}