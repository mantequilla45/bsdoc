import React from 'react';
import Image from 'next/image';


const ImageContainer = () => {
    return (
        <div>
            <Image
                alt="Search Page"
                className="absolute h-[800px] w-[1500px] right-0 bottom-0"
                src="/graphics/searchpage.svg"
                width={0}
                height={0}
            />
            <Image
                alt="Search Page"
                className="absolute h-[700px] w-[1350px] right-0 bottom-5"
                src="/graphics/searchpageicon.svg"
                width={0}
                height={0}
            />
        </div>
    );
};

export default ImageContainer;