import { useAuth } from '../../contexts/AuthContext';
import { Typography, CircularProgress, Box } from '@mui/material';

const UserInfos: React.FC = () => {
    const auth = useAuth();

    if (auth?.loading) {
        return <CircularProgress />;
    }

    if (!auth?.user) {
        return <Typography>Usuário não encontrado.</Typography>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', padding: '2em', textAlign: 'center', gap: '1em' }}>
            {auth?.user.image && <img src={`http://localhost:3333${auth?.user.image}`} alt={auth?.user.name} 
                style={{ width: '450px', objectFit: 'cover', objectPosition: 'center' }} />}
            <Typography variant="h5">{auth.user.name}</Typography>
            <Typography variant="body1">{auth.user.email}</Typography>
        </Box>
    );
}

export default UserInfos;