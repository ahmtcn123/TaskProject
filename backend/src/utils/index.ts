import bcrypt from 'bcrypt';
//Hash password with bcrypt
export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

//Compare password with bcrypt
export const comparePassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword)
}

export const tryJsonParse = (data: string) => {
    try {
        return JSON.parse(data)
    } catch (error) {
        return false;
    }
}