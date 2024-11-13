import Danillo from '@public/assets/danillo.png';
import Image from 'next/image';

export default function Layout({
    children,
  }: {
    children: React.ReactNode;
  }) {

  return (
    <main className="flex flex-col items-center sm:items-start h-full">
      <div className="flex flex-col lg:flex-row w-full h-screen">
        <div className="hidden h-screen lg:flex lg:min-w-[700px] ">
          <Image
            src={Danillo}
            alt="Na imagem, Danillo Estrela formando em medicina"
            className="h-screen w-auto min-w-full object-cover"
            priority
          />
        </div>
        <section className="w-full pt-[5%] px-[5%] flex-grow">
          <div className="max-w-[680px]">
            {children}
          </div>
        </section>
        <div className="w-full h-screen flex items-end lg:hidden">
          <Image
            src={Danillo}
            alt="Na imagem, Danillo Estrela formando em medicina"
            className="w-auto object-cover"
            priority
          />
        </div>
      </div>
    </main>
  );
};