import FAQItem from "@/components/Products/ProductDetails/FAQItem";
import { twMerge } from "tailwind-merge";

export default function FAQSection({ product }: any) {
  return (
    <div className="mx-auto px-4 space-y-6 container">
      <div
        className={twMerge("", product.collection == "Eyewear" ? "hidden" : "")}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-center">
          Contacts FAQs
        </h2>
        <FAQItem
          title="How soon will I get my contact lenses?"
          openFlag={false}
        >
          <p className="text-gray-500">
            After we receive all necessary prescription and billing information,
            you can expect to receive your contact lenses in minimum 3 business
            days. Specialty contacts, including toric lenses and made-to-order
            lenses (e.g., Biofinity XR, Proclear XR), may take longer to arrive.
            In rare cases, due to manufacturing and supply chain issues, certain
            products may be on backorder—if that&apos;s the case, our CX team
            will reach out to let you know about the delay.
          </p>
        </FAQItem>

        <FAQItem
          title="Is there an expedited shipping option to get my contact lenses faster?"
          openFlag={false}
        >
          <p className="text-gray-500">
            Yes! We offer expedited, three-day shipping for an additional $25.
            You can add expedited shipping to your order during checkout.
          </p>
        </FAQItem>

        <FAQItem
          title="Can I use my glasses prescription to order my contacts?"
          openFlag={false}
        >
          <p className="text-gray-500">
            You&apos;ll need a contacts-specific prescription to order your
            lenses. Here&apos;s why: Contacts sit directly on top of the cornea,
            while glasses sit at a distance away from the eyes, so prescription
            strength may differ between the two. Contacts have fixed
            measurements and variations determined by their manufacturers. These
            qualities can mean your prescription needs adjusting when it comes
            to the strength of your contact lenses vs. the strength of your
            glasses lenses. Contacts prescriptions include values that glasses
            prescriptions don&apos;t, like the base curve and diameter. Contacts
            prescriptions include a specific brand for your lenses.
          </p>
        </FAQItem>

        <FAQItem
          title="Do I need a prescription specific to this brand to purchase it?"
          openFlag={false}
        >
          <p className="text-gray-500">
            Yes, you&apos;ll need a contacts prescription specific to the brand
            you&apos;re purchasing. Because contact lenses are a medical device,
            and different brands have different features and measurements, the
            brand of lenses you order must be prescribed by your optometrist. If
            you ever want to switch brands or try a new one, just let your
            optometrist know or book an eye exam at one of our stores.
          </p>
        </FAQItem>

        <FAQItem
          title="Do I need a copy of my prescription to purchase the contacts?"
          openFlag={false}
        >
          <p className="text-gray-500">
            You&apos;ll need to provide an accurate, unexpired prescription
            before we can process your order. Your prescription must include the
            brand name of the lenses you&apos;re ordering, plus a doctor&apos;s
            signature. If you don&apos;t have your prescription on hand, we can
            contact your optometrist for a copy—just enter their information at
            checkout.
          </p>
        </FAQItem>

        <FAQItem
          title="What do other customers say about their experience buying contacts with Focal Optical?"
          openFlag={false}
        >
          <ul className="space-y-2 font-medium text-gray-500 list-disc list-inside">
            <li>
              &quot;Ordering process was easy, and I immediately received
              delivery of my contacts.&quot; <b>– Mamta P</b>
            </li>
            <li>
              &quot;The speed of delivery for my son&apos;s contacts was
              impressive.&quot; <b>– Phoenix M</b>
            </li>
            <li>
              &quot;The customer service was excellent, and I received my
              contacts within a few days.&quot; <b>– Sarah T</b>
            </li>
            <li>
              &quot;The quality of the contacts was top-notch, and I&apos;m very
              satisfied with my purchase.&quot; <b>– John D</b>
            </li>
          </ul>
        </FAQItem>

        <FAQItem
          title="What is the new contacts customer discount?"
          openFlag={false}
        >
          <p className="text-gray-500">
            Place your first order of lenses with us and get 20% off,
            automatically (no promo code needed!). Nab up to a year&apos;s
            supply for maximum savings. If you have FSA/HSA dollars or a gift
            card, you can put them to use as well. If you use in-network
            insurance, you won&apos;t be eligible for the discount, but
            you&apos;ll be saving with your insurance instead :-). Terms and
            conditions apply.
          </p>
        </FAQItem>

        <FAQItem
          title="Can I use my current contacts prescription to order colored contact lenses?"
          openFlag={false}
        >
          <p className="text-gray-500">
            If you&apos;d like to order colored contacts, you&apos;ll need to
            provide an accurate, unexpired prescription specifically for colored
            contact lenses. Because contact lenses are a medical device, and
            different brands have different features and measurements, the brand
            of lenses you order must be prescribed by your optometrist. If you
            do have a prescription for colored contacts, you can order any color
            choice from that brand without the color needing to be specified on
            the prescription!
          </p>
        </FAQItem>
      </div>

      <div
        className={twMerge("", product.collection != "Eyewear" ? "hidden" : "")}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-center">
          Eyewear FAQs
        </h2>
        <FAQItem
          title="How do I know which eyeglass frame suits my face?"
          openFlag={false}
        >
          <div className="flex flex-col gap-4 text-gray-500 tracking-tight">
            <p className="">
              No need to call in a fashion expert — it&apos;s easier than you
              think!
            </p>

            <div className="flex flex-col gap-2">
              <p className="">A general rule:</p>
              <ul className="space-y-2 font-medium text-gray-500 list-disc list-inside">
                <li>
                  <b>Round faces</b> - square or rectengular frames
                </li>
                <li>
                  <b>Square faces</b> - round or oval frames
                </li>
                <li>
                  <b>Heart-shaped faces</b> - bottom-heavy or rimless frames
                </li>
                <li>
                  <b>Oval faces</b> - lucky you, almost anything works!
                </li>
              </ul>
            </div>

            <p className="">
              Still unsure? Try our virtual try-on (coming soon) or ask a
              stylish friend (or your mom — she&apos;s brutally honest).
            </p>
          </div>
        </FAQItem>

        <FAQItem
          title="Can I get glasses if I don't need a prescription?"
          openFlag={false}
        >
          <div className="flex flex-col gap-2 text-gray-500 tracking-tight">
            <p>Yes, yes, and absolutely yes!</p>

            <p>
              We&apos;ve got clear lenses, blue light blockers, and
              fashion-forward frames for when you just want to look smart
              without the math homework. No prescription? No problem!
            </p>
          </div>
        </FAQItem>

        <FAQItem
          title="What are blue light glasses, and do I need them?"
          openFlag={false}
        >
          <div className="flex flex-col gap-2 text-gray-500 tracking-tight">
            <p>Blue light glasses = your eyes&apos; BFFs for screen time.</p>

            <p>
              They help reduce eye strain, headaches, and late-night
              doomscrolling guilt. If you're glued to your phone, laptop, or
              Netflix (guilty 🙋‍♂️), they&apos;re definitely worth trying.
            </p>
          </div>
        </FAQItem>

        <FAQItem
          title="What's the difference between single vision, bifocal, and progressive lenses?"
          openFlag={false}
        >
          <div className="flex flex-col gap-4 text-gray-500 tracking-tight">
            <p className="">Great question! Here&apos;s the simple scoop:</p>
            <ul className="space-y-2 font-medium text-gray-500 list-disc list-inside">
              <li>
                <b>Single vision:</b> One prescription for one task (like
                reading or distance).
              </li>
              <li>
                <b>Bifocal:</b> Two prescriptions in one lens (split by a
                visible line).
              </li>
              <li>
                <b>Progressive:</b> Multiple prescriptions with a smooth,
                line-free transition — kind of like lens magic. 🪄
              </li>
            </ul>
          </div>
        </FAQItem>

        <FAQItem title="How do I clean my glasses properly?" openFlag={false}>
          <div className="flex flex-col gap-2 text-gray-500 tracking-tight">
            <p>Skip the shirt wipe (yes, we see you).</p>

            <p>
              Use a microfiber cloth + lens cleaner (or a tiny drop of dish soap
              + lukewarm water), then dry with a soft cloth. No tissues, no
              paper towels — your lenses deserve spa treatment!
            </p>
          </div>
        </FAQItem>

        <FAQItem title="How often should I get new glasses?" openFlag={false}>
          <div className="flex flex-col gap-4 text-gray-500 tracking-tight">
            <p>Generally, every 1-2 year — or if:</p>
            <ul className="space-y-2 font-medium text-gray-500 list-disc list-inside">
              <li>Your prescription changes</li>
              <li>Your frames are tired and over it</li>
              <li>You just want a fresh new look (we support your glowup!)</li>
            </ul>
          </div>
        </FAQItem>
      </div>
    </div>
  );
}
