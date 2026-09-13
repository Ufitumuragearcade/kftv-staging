import React from "react";

const TermsConditions = () => {
  return (
    <section className="bg-[#e6f4fa] py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Terms and Conditions
          </h1>
          <p className="text-xl md:text-2xl text-gray-900 italic">
            Kigali Film and Television School (KFTV)
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Effective Date: 08 September 2026 | Last Updated: 08 September 2026
            | Website: www.kftvschool.com
          </p>
        </div>

        <div className="space-y-8 text-gray-900 leading-relaxed text-base">
          {/* 1. Introduction */}
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              1. Introduction
            </h2>
            <p>
              These Terms and Conditions govern the use of the Kigali Film and
              Television School website, online application system, student
              portal, online payment services, and related services provided by
              Kigali Film and Television School, hereinafter referred to as
              "KFTV," "the School," "we," "us," or "our."
            </p>
            <p className="mt-2">
              By accessing the KFTV website, creating an account, submitting an
              application, registering for a programme, making an online payment,
              or enrolling as a student, you agree to be bound by these Terms and
              Conditions.
            </p>
            <p className="mt-2">
              These Terms should be read together with: The KFTV Privacy Policy;
              The Online Payment Policy; The Student Admission Letter; The
              Student Rules and Regulations; Any programme-specific requirements.
            </p>
          </div>

          {/* PART A: Website Terms */}
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              PART A: Website Terms and Conditions
            </h2>
          </div>

          {/* 2. Use of Website */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              2. Use of the KFTV Website
            </h3>
            <p>
              The official KFTV website provides information and services
              relating to academic programmes, admissions, student applications,
              course registration, online payments, school announcements,
              training opportunities, events and activities, and student
              services.
            </p>
            <p className="mt-2">
              Users agree to use the website only for lawful purposes. You must
              not use the website to submit false or misleading information,
              impersonate another person, upload malicious software, attempt
              unauthorised access to KFTV systems, interfere with the operation
              of the website, copy or misuse website content without permission,
              engage in fraudulent payment activities, or violate applicable laws
              or regulations.
            </p>
          </div>

          {/* 3. Website Information */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              3. Website Information
            </h3>
            <p>
              KFTV makes reasonable efforts to ensure that information published
              on its website is accurate and up to date. However, KFTV does not
              guarantee that all information will always be complete, current, or
              that the website will always be available without interruption.
            </p>
            <p className="mt-2">
              KFTV reserves the right to modify, update, suspend, or discontinue
              any information, programme, service, course, fee, or website
              feature without prior notice where necessary.
            </p>
          </div>

          {/* 4. Intellectual Property */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              4. Intellectual Property
            </h3>
            <p>
              Unless otherwise stated, all content available on the KFTV website
              is owned by or licensed to Kigali Film and Television School. This
              includes the KFTV name, logo, website design, text, photographs,
              videos, films, training materials, graphics, publications, course
              descriptions, audio materials, and other institutional content.
            </p>
            <p className="mt-2">
              Users may not reproduce, distribute, modify, sell, publish, or
              commercially exploit KFTV content without prior written permission.
            </p>
          </div>

          {/* PART B: Online Application Terms */}
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              PART B: Online Application Terms
            </h2>
          </div>

          {/* 5. Eligibility */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              5. Eligibility to Apply
            </h3>
            <p>
              Applicants must meet the minimum entry requirements for the
              programme they are applying for. The current KFTV admission
              requirements indicate that applicants should normally possess at
              least an Advanced Level Certificate (A2) or an equivalent
              recognised qualification.
            </p>
            <p className="mt-2">
              KFTV reserves the right to establish additional entry requirements
              depending on the programme, level of study, course duration,
              professional requirements, portfolio requirements, language
              requirements, and other academic considerations.
            </p>
          </div>

          {/* 6. Online Application Account */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              6. Online Application Account
            </h3>
            <p>
              Applicants may be required to create an online account before
              submitting an application. Applicants are responsible for providing
              accurate registration information, maintaining the confidentiality
              of login credentials, using their own account, updating inaccurate
              or outdated information, and reporting unauthorised access
              immediately.
            </p>
          </div>

          {/* 7. Accuracy */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              7. Accuracy of Application Information
            </h3>
            <p>
              By submitting an online application, the applicant confirms that
              all information provided is true and accurate, all uploaded
              documents are genuine, and the applicant understands that false
              information may result in rejection or cancellation of admission.
            </p>
            <p className="mt-2">
              KFTV reserves the right to verify submitted information and
              documents. Where fraudulent documents or information are
              discovered, KFTV may reject the application, cancel admission,
              terminate student registration, and report suspected fraud to
              relevant authorities.
            </p>
          </div>

          {/* 8. Documents */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              8. Application Documents
            </h3>
            <p>
              Applicants may be required to upload or submit documents including
              national identity card, passport, academic certificates, academic
              transcripts, passport photographs, previous qualifications,
              portfolio or creative work, and other documents required for
              admission.
            </p>
          </div>

          {/* 9. Fees */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              9. Application Fees
            </h3>
            <p>
              KFTV may charge an application or registration fee for certain
              programmes or services. Where applicable, the amount will be
              communicated before payment. Application fees may be non-refundable
              unless otherwise stated. Payment of an application fee does not
              guarantee admission.
            </p>
          </div>

          {/* 10. Review */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              10. Application Review and Admission
            </h3>
            <p>
              All applications will be reviewed according to KFTV admission
              procedures and programme requirements. KFTV may accept or reject an
              application, request additional information or an interview, and
              place an applicant on a waiting list. Admission decisions will be
              communicated through the applicant's online account, email,
              telephone, or official admission letter.
            </p>
          </div>

          {/* 11. Acceptance */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              11. Acceptance of Admission
            </h3>
            <p>
              An applicant who receives an admission offer may be required to
              confirm acceptance, pay required fees, submit original documents,
              complete registration, agree to KFTV rules and regulations, and
              attend orientation. Failure to complete registration requirements
              within the specified period may result in the admission offer being
              withdrawn.
            </p>
          </div>

          {/* PART C: Online Payment Terms */}
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              PART C: Online Payment Terms and Conditions
            </h2>
          </div>

          {/* 12. Payment Methods */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              12. Accepted Payment Methods
            </h3>
            <p>
              KFTV may accept payments through Mobile Money (MoMo), debit cards,
              credit cards, bank cards, bank transfers, and other electronic
              payment systems approved by KFTV.
            </p>
          </div>

          {/* 13. Authorisation */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              13. Authorisation to Make Payment
            </h3>
            <p>
              By making a payment through the KFTV website, the user confirms
              that they are authorised to use the selected payment method, the
              payment information provided is accurate, and the payment is being
              made for a legitimate KFTV service or obligation.
            </p>
          </div>

          {/* 14. Security */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              14. Payment Security
            </h3>
            <p>
              KFTV will make reasonable efforts to provide secure online payment
              services. Payments may be processed through authorised third-party
              payment service providers. KFTV does not require users to provide
              Mobile Money PIN, Card PIN, CVV through email or social media, or
              banking passwords.
            </p>
            <p className="mt-2 text-sm italic">
              Users must never share sensitive payment credentials with KFTV
              employees through WhatsApp, SMS, email, social media, or telephone
              calls.
            </p>
          </div>

          {/* 15. Confirmation */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              15. Payment Confirmation
            </h3>
            <p>
              A payment is considered successful only after confirmation from the
              authorised payment provider and the KFTV payment system. After
              successful payment, the user may receive an electronic
              confirmation, a transaction reference number, a payment receipt,
              and an email notification.
            </p>
          </div>

          {/* 16. Failed Payments */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              16. Failed or Incomplete Payments
            </h3>
            <p>
              A payment may fail due to insufficient funds, incorrect payment
              details, network interruptions, bank or Mobile Money system
              failures, payment provider errors, expired cards, or security
              restrictions. KFTV will not be responsible for delays caused by
              third-party payment providers.
            </p>
          </div>

          {/* 17. Duplicate Payments */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              17. Duplicate Payments
            </h3>
            <p>
              If a user accidentally makes the same payment more than once, they
              should immediately notify KFTV with evidence of both transactions.
              KFTV will investigate the matter and may apply the excess amount
              toward future fees, process a refund where applicable, or credit
              the student's account.
            </p>
          </div>

          {/* 18. Refunds */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              18. Refunds
            </h3>
            <p>
              Refunds are governed by the official KFTV Refund and Cancellation
              Policy. Unless otherwise stated:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Application fees are non-refundable</li>
              <li>
                Payments for services already provided may not be refundable
              </li>
              <li>
                Tuition fees are non-refundable. However, we allow you to suspend
                and take the course in future or switch from one study mode to
                another (e.g., campus to online or online to campus).
              </li>
            </ul>
          </div>

          {/* 19. Fees */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              19. Fees and Programme Costs
            </h3>
            <p>
              Programme fees may vary depending on programme duration, course
              selected, mode of study, scholarships or bursaries, and special
              promotions. The fees displayed on the official KFTV website or
              communicated through an official admission offer at the time of
              enrolment will apply.
            </p>
          </div>

          {/* PART D: Student Enrolment Terms */}
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              PART D: Student Enrolment Terms
            </h2>
          </div>

          {/* 20. Registration */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              20. Student Registration
            </h3>
            <p>
              A student is considered fully registered only after completing all
              applicable registration requirements, including acceptance letter
              issuance, admission letter issuance, payment of required fees,
              verification of identity, completion of registration forms, and
              acceptance of school policies.
            </p>
          </div>

          {/* 21. Attendance */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              21. Attendance
            </h3>
            <p>
              Students are expected to attend classes, practical sessions,
              workshops, productions, and other academic activities as required by
              their programme. The current KFTV admission terms require students
              to maintain a minimum attendance level of 95 percent. Repeated
              unexplained absences may lead to discontinuation.
            </p>
          </div>

          {/* 22. Academic Requirements */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              22. Academic Requirements
            </h3>
            <p>
              Students must attend required classes, complete assignments,
              participate in practical activities, sit for required assessments
              and examinations, complete production projects, and meet programme
              completion requirements. Depending on the programme, students may
              be required to complete practical projects such as short films,
              music videos, audio productions, acting projects, animated
              productions, visual effects projects, and graphic design projects.
            </p>
          </div>

          {/* 23. Certification */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              23. Certification
            </h3>
            <p>
              A student may receive a certificate or other academic award only
              after fulfilling all applicable requirements, including academic
              requirements, assessment requirements, attendance requirements,
              financial clearance, completion of required projects, return of
              borrowed equipment, and compliance with other institutional
              requirements.
            </p>
          </div>

          {/* 24. Conduct */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              24. Student Conduct
            </h3>
            <p>
              Students are expected to behave respectfully and professionally.
              The following conduct may be prohibited: harassment, violence,
              fighting, theft, property damage, vulgar or abusive language,
              discrimination, intimidation, academic dishonesty, drug or alcohol
              abuse during school activities, disruption of classes, and misuse
              of school facilities.
            </p>
          </div>

          {/* 25. Facilities */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              25. Use of School Facilities
            </h3>
            <p>
              Students may access KFTV facilities and equipment according to
              programme requirements and institutional procedures. Facilities may
              include studios, cameras, lighting equipment, sound equipment,
              editing suites, computers, and production facilities. Students must
              use all equipment responsibly.
            </p>
          </div>

          {/* 26. Damage */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              26. Damage to Equipment
            </h3>
            <p>
              Students are responsible for equipment assigned to them or damaged
              through negligence or misuse. Where a student intentionally or
              negligently damages school property, KFTV may require the student
              to repair, replace, or pay the reasonable cost of repair or
              replacement.
            </p>
          </div>

          {/* 27. Personal Property */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              27. Personal Property
            </h3>
            <p>
              Students are responsible for their personal belongings while
              attending KFTV. KFTV will take reasonable care of its facilities
              but will not generally be responsible for loss, theft, or damage to
              personal property unless liability arises under applicable law.
            </p>
          </div>

          {/* 28. Communication */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              28. Student Communication
            </h3>
            <p>
              Students must provide accurate and active contact information and
              are responsible for regularly checking official KFTV communications.
              Official notices may be sent through email, student portal, SMS,
              official website, official KFTV social media platforms, and notice
              boards.
            </p>
          </div>

          {/* PART E: Photography and IP */}
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              PART E: Photography, Filming and Intellectual Property
            </h2>
          </div>

          {/* 29. Photography */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              29. Photography and Videography
            </h3>
            <p>
              As a film and television institution, photography, videography,
              filmmaking, and recording are essential parts of KFTV academic
              activities. Students may be photographed or recorded during
              classes, productions, workshops, events, exhibitions, graduation
              ceremonies, and institutional activities.
            </p>
          </div>

          {/* 30. Marketing */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              30. Marketing Use of Student Images
            </h3>
            <p>
              KFTV may request consent to use student photographs or videos for
              the KFTV website, social media, brochures, advertising,
              promotional campaigns, and institutional publications. Where
              required by applicable privacy laws, promotional or commercial use
              of identifiable student images will be subject to appropriate
              consent.
            </p>
          </div>

          {/* 31. Creative Work */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              31. Student Creative Work
            </h3>
            <p>
              Students retain rights in their original creative work to the
              extent provided by applicable intellectual property laws. However,
              KFTV may retain copies of student work for academic assessment,
              institutional archives, accreditation, exhibitions, student
              showcases, and educational purposes. KFTV reserves the right to
              commercially exploit student work beyond legitimate academic or
              promotional purposes.
            </p>
          </div>

          {/* PART F: Termination */}
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              PART F: Termination and Disciplinary Action
            </h2>
          </div>

          {/* 32. Suspension */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              32. Suspension or Termination
            </h3>
            <p>
              KFTV may suspend or terminate a student's registration where the
              student provides fraudulent documents, fails to meet academic
              requirements, fails to comply with financial obligations, engages
              in serious misconduct, damages school property, violates school
              rules, engages in criminal activity, endangers other students or
              staff, or misuses the KFTV online platform.
            </p>
          </div>

          {/* 33. Withdrawal */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              33. Withdrawal from a Programme
            </h3>
            <p>
              Students wishing to withdraw from a programme should submit an
              official written request to KFTV. Withdrawal may affect tuition
              obligations, refund eligibility, student records, academic status,
              and scholarships or bursaries.
            </p>
          </div>

          {/* PART G: Limitation of Liability */}
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              PART G: Limitation of Liability
            </h2>
          </div>

          {/* 34. Availability */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              34. Website Availability
            </h3>
            <p>
              KFTV does not guarantee uninterrupted access to the website,
              online application systems, student portals, or payment systems.
              Services may be temporarily unavailable due to maintenance,
              technical problems, cybersecurity incidents, third-party service
              interruptions, internet failures, or events beyond KFTV's
              reasonable control.
            </p>
          </div>

          {/* 35. Third-Party */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              35. Third-Party Services
            </h3>
            <p>
              KFTV may use third-party providers for payment processing, Mobile
              Money services, card processing, website hosting, cloud storage,
              and communication systems. KFTV is not responsible for failures
              caused exclusively by third-party providers.
            </p>
          </div>

          {/* PART H: Privacy */}
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              PART H: Privacy and Data Protection
            </h2>
          </div>

          {/* 36. Personal Data */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              36. Personal Data
            </h3>
            <p>
              KFTV collects and processes personal information in accordance with
              its Privacy Policy and applicable data protection laws. By using
              the KFTV website or online application system, users acknowledge
              that personal information may be processed for application
              management, admission, student registration, academic
              administration, payment processing, communication, and legal
              compliance.
            </p>
          </div>

          {/* PART I: General Provisions */}
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              PART I: General Provisions
            </h2>
          </div>

          {/* 37. Changes */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              37. Changes to These Terms
            </h3>
            <p>
              KFTV reserves the right to update or modify these Terms and
              Conditions. Changes may result from changes in laws, changes in
              academic programmes, new technology, changes in payment systems, or
              institutional policy changes. The updated version will be published
              on the official KFTV website.
            </p>
          </div>

          {/* 38. Governing Law */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              38. Governing Law
            </h3>
            <p>
              These Terms and Conditions shall be governed by and interpreted in
              accordance with the laws of the Republic of Rwanda. Any dispute
              relating to these Terms shall, where possible, first be resolved
              through internal consultation and institutional procedures.
            </p>
          </div>

          {/* 39. Severability */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              39. Severability
            </h3>
            <p>
              If any provision of these Terms and Conditions is found to be
              invalid, unlawful, or unenforceable, the remaining provisions
              shall remain in effect.
            </p>
          </div>

          {/* 40. Entire Agreement */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              40. Entire Agreement
            </h3>
            <p>
              These Terms and Conditions, together with the Privacy Policy,
              Admission Letter, Student Rules and Regulations, Programme-specific
              requirements, and Payment and Refund Policies, form part of the
              agreement between KFTV and the applicant or student.
            </p>
          </div>

          {/* 41. Contact */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              41. Contact Information
            </h3>
            <p>
              For questions relating to these Terms and Conditions, please
              contact:
            </p>
            <div className="mt-2">
              <p className="font-semibold">KIGALI FILM AND TELEVISION SCHOOL (KFTV)</p>
              <p>Website: www.kftvschool.com</p>
              <p>Physical Address: Kimihurura, Gasabo District, City of Kigali, Rwanda</p>
              <p>Email: kftvschool@kftv.org</p>
              <p>Telephone: +250 788 306 623</p>
            </div>
          </div>

          {/* Online Acceptance */}
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              Online Acceptance Statement
            </h2>
            <p>
              I confirm that I have read, understood, and agree to the Kigali
              Film and Television School (KFTV) Terms and Conditions, Privacy
              Policy, and Online Payment Terms. I confirm that all information
              and documents submitted in my application are accurate and
              authentic.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsConditions;
