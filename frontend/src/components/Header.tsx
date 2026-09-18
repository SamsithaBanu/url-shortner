import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const Header = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-end justify-end w-full px-4 py-4">
            <div className="flex items-center justify-end gap-2">
                <Button
                    variant='default'
                    className='bg-[#0D1282] hover:bg-[#0D1282]/70 text-white'
                    onClick={() => navigate('/')}
                >
                    Short Url Create
                </Button>
                <Button
                    variant='outline'
                    onClick={() => navigate('/all-urls')}
                >
                    All Urls
                </Button>
            </div>
        </div>
    );
};

export default Header;
