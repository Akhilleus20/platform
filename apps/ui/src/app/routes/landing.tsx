import Website from 'remoteApp/KlaveWebsite';

function Landing() {
    console.log('Website', Website);
    return <div className='w-full'>
        <Website />
        {/* <iframe title='Klave Network' src='https://klave.com' className="w-full h-[6045px] overflow-hidden" scrolling="no" /> */}
    </div>;
}

export default Landing;