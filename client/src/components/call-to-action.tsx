import { Button } from './ui/button';

function CallToAction() {
  return (
    <section 
      className="relative py-10 sm:py-16 bg-black mt-[3px] mb-[3px] ml-[-15px] mr-[-15px] pt-[28px] pb-[28px]"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold mb-3">
            "La inversión en conocimiento paga el mejor interés"
          </h2>
          <p className="text-lg">— Benjamin Franklin</p>
        </div>
      </div>
    </section>
  );
}

export default CallToAction;
