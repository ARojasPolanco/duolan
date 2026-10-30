export interface LegalSection {
  title: string;
  body: string;
}

export interface LegalDocument {
  title: string;
  updated: string;
  sections: LegalSection[];
}

export const LEGAL_ES: Record<'terms' | 'privacy' | 'riot', LegalDocument> = {
  terms: {
    title: 'Términos de uso',
    updated: 'octubre de 2026',
    sections: [
      {
        title: 'Elegibilidad y aceptación',
        body: 'Duo LAN es un servicio exclusivo para personas mayores de 18 años que jueguen en el servidor LAN de League of Legends. Al crear una cuenta declarás que cumplís esa edad, que la información que proporcionás es correcta y que aceptás estos términos y la Política de Privacidad. Si no cumplís estos requisitos, no podés usar la plataforma.',
      },
      {
        title: 'Cuenta y seguridad',
        body: 'Sos responsable de mantener la confidencialidad de tu contraseña y de toda la actividad realizada desde tu cuenta. No compartas tus credenciales, no crees cuentas para evadir sanciones y avisanos si detectás un acceso no autorizado. Duo LAN puede solicitar verificaciones adicionales y suspender cuentas ante riesgos de seguridad o fraude.',
      },
      {
        title: 'Perfil y datos declarados',
        body: 'El Riot ID, el rango, los roles, los horarios y el estilo de juego son datos declarados por cada jugador. En el MVP no consultamos la API de Riot ni verificamos automáticamente la titularidad de una cuenta. Si declarás información falsa o engañosa, podemos advertirte, suspenderte o eliminar tu perfil. Tu Riot ID y tu Discord solo se revelan a otra persona después de una conexión.',
      },
      {
        title: 'Uso permitido',
        body: 'No está permitido el acoso, las amenazas, la discriminación, el spam, la suplantación de identidad, la publicación de datos personales de terceros, la venta de cuentas, el duo boost, el coaching, la publicidad no autorizada ni cualquier uso ilegal. Tampoco podés intentar vulnerar la seguridad, automatizar la plataforma, evadir límites o recolectar datos de otros usuarios sin autorización.',
      },
      {
        title: 'Contacto y coordinación',
        body: 'Duo LAN facilita que dos jugadores se encuentren y coordinen una partida. No organiza partidas, no participa en la comunicación externa, no intermedia pagos y no garantiza resultados dentro del juego. La coordinación, los horarios y cualquier acuerdo posterior son responsabilidad de los jugadores. No compartas información sensible ni realices pagos a personas que conozcas por la plataforma.',
      },
      {
        title: 'Reputación, reportes y moderación',
        body: 'El feedback, la reputación, los reportes y los bloqueos buscan cuidar la comunidad. Reportar a una persona puede bloquearla automáticamente. Podemos advertir, suspender temporalmente o suspender de forma permanente una cuenta, y podemos conservar evidencia de moderación después de una baja. Las decisiones de moderación buscan proteger a la comunidad y pueden revisarse por el equipo de soporte.',
      },
      {
        title: 'Propiedad intelectual y Riot Games',
        body: 'Duo LAN y sus elementos visuales propios están protegidos por las normas de propiedad intelectual aplicables. No usamos crests, logos ni assets oficiales de Riot Games en el MVP; los escudos de rango son ilustraciones originales. Riot Games y League of Legends son marcas de Riot Games, Inc. El servicio no está afiliado, avalado ni patrocinado por Riot Games.',
      },
      {
        title: 'Eliminación de cuenta',
        body: 'Podés solicitar la eliminación desde la app ingresando tu contraseña. La cuenta se desactiva y el perfil deja de ser visible. Durante los 30 días siguientes podés recuperarla iniciando sesión con tu email y contraseña. Pasado ese plazo, la cuenta y los datos personales se eliminan de forma permanente. Algunos registros de reportes, feedback, sanciones y métricas pueden conservarse anonimizados por moderación, seguridad y prevención de abuso.',
      },
      {
        title: 'Disponibilidad y cambios',
        body: 'El servicio es gratuito y puede cambiar, suspenderse o interrumpirse por mantenimiento, seguridad o evolución del producto. No garantizamos disponibilidad permanente ni conservación indefinida de contenidos. Podemos actualizar estos términos y publicaremos la versión vigente en esta página. El uso continuado después de un cambio implica su aceptación.',
      },
      {
        title: 'Limitación de responsabilidad',
        body: 'En la medida permitida por la ley, Duo LAN no responde por la conducta de otros usuarios, por la veracidad de los datos declarados, por los resultados de una partida, por el uso de plataformas externas como Discord o League of Legends, ni por daños indirectos derivados del uso del servicio. Nada en estos términos limita derechos que no puedan renunciarse legalmente.',
      },
      {
        title: 'Ley aplicable y contacto',
        body: 'Estos términos se interpretan según la legislación de la República Argentina. Ante cualquier consulta, reclamo o solicitud relacionada con la cuenta, escribinos a soporte@duolan.online. Si la cuenta se elimina, algunos registros de moderación, reportes, feedback y métricas agregadas pueden conservarse por seguridad y prevención de abuso.',
      },
    ],
  },
  privacy: {
    title: 'Política de privacidad',
    updated: 'octubre de 2026',
    sections: [
      {
        title: 'Responsable y alcance',
        body: 'Duo LAN es responsable de los datos personales que trata para operar la plataforma. Esta política explica qué datos recopilamos, para qué los usamos, con quién los compartimos y cómo podés ejercer tus derechos. El contacto de privacidad es soporte@duolan.online.',
      },
      {
        title: 'Datos que recopilamos',
        body: 'Recopilamos los datos de cuenta (username, email y contraseña cifrada), los datos de perfil (Riot ID, rango declarado, roles, horarios, idiomas, estilo de juego, micrófono, bio, Discord y WhatsApp opcionales), la actividad en la plataforma (likes, conexiones, invitaciones, disponibilidad, postulaciones, feedback, reportes, bloqueos y notificaciones) y datos técnicos mínimos (logs, identificadores de request, dirección IP y estado de la sesión). Si activás push, guardamos el endpoint y las claves de la suscripción. No pedimos datos sensibles ni los datos de tu cuenta de Riot.',
      },
      {
        title: 'Para qué los usamos',
        body: 'Usamos los datos para crear y administrar tu cuenta, mostrar tu perfil, calcular compatibilidad, gestionar likes, conexiones, disponibilidad, invitaciones, postulaciones, feedback, reputación, reportes y bloqueos; enviar emails de verificación, reset y seguridad; enviar notificaciones y push si lo autorizás; moderar la comunidad; medir KPIs agregados; prevenir fraude y abuso; y cumplir obligaciones legales. Las bases son la ejecución del servicio que pediste, tu consentimiento para push y verificaciones opcionales, el interés legítimo en seguridad y moderación, y el cumplimiento de obligaciones legales.',
      },
      {
        title: 'Qué se muestra a otras personas',
        body: 'Tu email nunca se muestra en el perfil público. El Riot ID, el Discord y el WhatsApp solo se revelan a la persona con la que concretaste una conexión. El perfil público puede mostrar username, país, rango declarado, roles, horarios, idiomas, micrófono, estilo, bio, reputación y estado de disponibilidad. No publiques datos personales sensibles en la bio ni en mensajes de invitación.',
      },
      {
        title: 'Cookies y almacenamiento local',
        body: 'En el MVP usamos almacenamiento local del navegador para guardar el token de sesión, el idioma y preferencias básicas. No usamos cookies de publicidad ni tracking de terceros. Si en el futuro incorporamos analítica o publicidad, actualizaremos esta política y pediremos las autorizaciones que correspondan.',
      },
      {
        title: 'Proveedores y transferencias',
        body: 'Para operar el servicio podemos usar proveedores de infraestructura y comunicación, como Neon (base de datos), Render (API), Vercel (web), Resend (emails), hCaptcha (captcha) y el servicio de push del navegador cuando lo autorizás. Estos proveedores pueden alojar o procesar datos fuera de Argentina. No vendemos datos personales ni los compartimos para publicidad de terceros.',
      },
      {
        title: 'Conservación',
        body: 'Conservamos los datos mientras tu cuenta esté activa y durante el tiempo necesario para operar el servicio, atender reclamos, cumplir obligaciones legales y prevenir abuso. Algunos registros de moderación, reportes, feedback, sanciones y métricas agregadas pueden conservarse después de la baja por seguridad y prevención de abuso.',
      },
      {
        title: 'Baja y recuperación',
        body: 'Podés programar la eliminación de tu cuenta desde la app con tu contraseña. La cuenta se desactiva y deja de mostrarse, pero puede recuperarse iniciando sesión dentro de los 30 días siguientes. Si no la recuperás, se eliminan tus datos personales y el perfil. La recuperación cancela automáticamente la eliminación programada.',
      },
      {
        title: 'Seguridad',
        body: 'Aplicamos medidas técnicas y organizativas razonables: contraseñas con hash bcrypt, tokens de verificación y reset con vencimiento, HTTPS, control de acceso, límites de uso y minimización de datos. Ningún sistema es completamente infalible. Si detectás un incidente de seguridad, escribinos de inmediato a soporte@duolan.online.',
      },
      {
        title: 'Tus derechos',
        body: 'Podés eliminar tu cuenta desde la app o solicitar acceso, rectificación, actualización, confidencialidad u oposición al tratamiento escribiendo a soporte@duolan.online. También podés pedir información sobre el uso de tus datos y revocar el consentimiento para push desde la configuración del navegador. En Argentina podés dirigirte a la Agencia de Acceso a la Información Pública si considerás que no atendimos correctamente tu solicitud.',
      },
      {
        title: 'Menores de edad',
        body: 'Duo LAN es exclusivamente para mayores de 18 años. No creamos cuentas para menores ni recolectamos deliberadamente sus datos. Si detectamos una cuenta de una persona menor de edad, la suspenderemos y eliminaremos los datos que corresponda.',
      },
      {
        title: 'Cambios y contacto',
        body: 'Podemos actualizar esta política para reflejar cambios del producto, de los proveedores o de la ley. Publicaremos la versión vigente en esta página. Las consultas de privacidad se reciben en soporte@duolan.online.',
      },
    ],
  },
  riot: {
    title: 'Aviso de Riot',
    updated: 'octubre de 2026',
    sections: [
      {
        title: 'Sin afiliación',
        body: 'Duo LAN es un proyecto independiente para la comunidad de League of Legends del servidor LAN. No está afiliado, avalado, patrocinado ni asociado oficialmente con Riot Games. Riot Games y League of Legends son marcas de Riot Games, Inc. El aviso completo exigido por Riot se muestra al pie de esta página.',
      },
      {
        title: 'Assets y marcas',
        body: 'En el MVP no usamos crests de rango, logos ni otros assets oficiales de Riot. Los escudos de rango de Duo LAN son ilustraciones SVG originales. Si en el futuro Riot autoriza el uso de determinados assets, actualizaremos esta página y la documentación del producto antes de incorporarlos.',
      },
      {
        title: 'Datos declarados y API',
        body: 'El rango, los roles y los horarios son declarados por cada jugador. En el MVP no consultamos la API de Riot ni usamos Riot Sign On, por lo que no verificamos automáticamente la titularidad de una cuenta. Si en el futuro integramos la API con una production key, la verificación de titularidad requerirá RSO y el jugador deberá autorizarla.',
      },
      {
        title: 'Uso permitido',
        body: 'Duo LAN no vende cuentas, no ofrece duo boost, no presta servicios de coaching y no organiza partidas. Cualquier servicio de ese tipo queda fuera del alcance del producto y no está autorizado en la plataforma.',
      },
      {
        title: 'Contacto',
        body: 'Consultas sobre este aviso o sobre el uso de marcas: soporte@duolan.online.',
      },
    ],
  },
};

export const LEGAL_EN: Record<'terms' | 'privacy' | 'riot', LegalDocument> = {
  terms: {
    title: 'Terms of use',
    updated: 'October 2026',
    sections: [
      {
        title: 'Eligibility and acceptance',
        body: 'Duo LAN is a service exclusively for people aged 18 or older who play on the League of Legends LAN server. By creating an account you declare that you meet that age requirement, that the information you provide is accurate and that you accept these terms and the Privacy Policy. If you do not meet these requirements, you may not use the platform.',
      },
      {
        title: 'Account and security',
        body: 'You are responsible for keeping your password confidential and for all activity carried out from your account. Do not share your credentials, do not create accounts to evade sanctions and let us know if you detect unauthorized access. Duo LAN may request additional verification and suspend accounts when there are security or fraud risks.',
      },
      {
        title: 'Profile and declared data',
        body: 'Riot ID, rank, roles, schedule and play style are declared by each player. In the MVP we do not query the Riot API or automatically verify account ownership. If you declare false or misleading information, we may warn, suspend or remove your profile. Your Riot ID, Discord and WhatsApp are revealed to another person only after a connection.',
      },
      {
        title: 'Permitted use',
        body: 'Harassment, threats, discrimination, spam, impersonation, publishing third-party personal data, account sales, duo boost, coaching, unauthorized advertising and any illegal use are prohibited. You may not attempt to breach security, automate the platform, evade limits or collect data from other users without authorization.',
      },
      {
        title: 'Contact and coordination',
        body: 'Duo LAN helps two players meet and coordinate a game. It does not organize games, participate in external communication, intermediate payments or guarantee in-game results. Coordination, schedules and any later agreement are the players’ responsibility. Do not share sensitive information or make payments to people you meet through the platform.',
      },
      {
        title: 'Reputation, reports and moderation',
        body: 'Feedback, reputation, reports and blocks are intended to protect the community. Reporting a person may block them automatically. We may warn, temporarily suspend or permanently suspend an account, and we may retain moderation evidence after account deletion. Moderation decisions aim to protect the community and may be reviewed by the support team.',
      },
      {
        title: 'Intellectual property and Riot Games',
        body: 'Duo LAN and its own visual elements are protected by applicable intellectual property rules. We do not use official Riot Games crests, logos or assets in the MVP; rank shields are original illustrations. Riot Games and League of Legends are trademarks of Riot Games, Inc. The service is not affiliated with, endorsed by or sponsored by Riot Games.',
      },
      {
        title: 'Account deletion',
        body: 'You can request deletion from the app by entering your password. The account is deactivated and the profile stops being visible. During the following 30 days you can recover it by logging in with your email and password. After that period, the account and personal data are permanently deleted. Some report, feedback, sanction and metric records may be kept anonymized for moderation, security and abuse prevention.',
      },
      {
        title: 'Availability and changes',
        body: 'The service is free and may change, be suspended or be interrupted for maintenance, security or product evolution. We do not guarantee permanent availability or indefinite retention of content. We may update these terms and will publish the current version on this page. Continued use after a change means acceptance.',
      },
      {
        title: 'Limitation of liability',
        body: 'To the extent permitted by law, Duo LAN is not responsible for the conduct of other users, the accuracy of declared data, the results of a game, the use of external platforms such as Discord or League of Legends, or indirect damages arising from use of the service. Nothing in these terms limits rights that cannot legally be waived.',
      },
      {
        title: 'Governing law and contact',
        body: 'These terms are interpreted under the laws of the Argentine Republic. For any question, claim or account request, write to soporte@duolan.online. If the account is deleted, some moderation, report, feedback and aggregate metric records may be retained for security and abuse prevention.',
      },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    updated: 'October 2026',
    sections: [
      {
        title: 'Controller and scope',
        body: 'Duo LAN is responsible for the personal data it processes to operate the platform. This policy explains what data we collect, why we use it, with whom we share it and how you can exercise your rights. The privacy contact is soporte@duolan.online.',
      },
      {
        title: 'Data we collect',
        body: 'We collect account data (username, email and hashed password), profile data (Riot ID, declared rank, roles, schedule, languages, play style, microphone, bio, optional Discord and optional WhatsApp), platform activity (likes, connections, invitations, availability, applications, feedback, reports, blocks and notifications) and minimal technical data (logs, request identifiers, IP address and session status). If you enable push, we store the subscription endpoint and keys. We do not request sensitive data or data from your Riot account.',
      },
      {
        title: 'How we use it',
        body: 'We use data to create and manage your account, show your profile, calculate compatibility, manage likes, connections, availability, invitations, applications, feedback, reputation, reports and blocks; send verification, reset and security emails; send notifications and push if you authorize it; moderate the community; measure aggregate KPIs; prevent fraud and abuse; and comply with legal obligations. The bases are performance of the service you requested, your consent for push and optional verification, legitimate interest in security and moderation, and compliance with legal obligations.',
      },
      {
        title: 'What other people see',
        body: 'Your email is never shown on your public profile. Riot ID, Discord and WhatsApp are revealed only to the person with whom you established a connection. The public profile may show username, country, declared rank, roles, schedule, languages, microphone, style, bio, reputation and availability status. Do not publish sensitive personal data in your bio or invitation messages.',
      },
      {
        title: 'Cookies and local storage',
        body: 'In the MVP we use browser local storage to save the session token, language and basic preferences. We do not use advertising cookies or third-party tracking. If we add analytics or advertising in the future, we will update this policy and request the corresponding authorizations.',
      },
      {
        title: 'Providers and transfers',
        body: 'To operate the service we may use infrastructure and communication providers such as Neon (database), Render (API), Vercel (web), Resend (emails), hCaptcha (captcha) and the browser push service when you authorize it. These providers may host or process data outside Argentina. We do not sell personal data or share it for third-party advertising.',
      },
      {
        title: 'Retention',
        body: 'We retain data while your account is active and for the time necessary to operate the service, handle claims, comply with legal obligations and prevent abuse. Some moderation, report, feedback, sanction and aggregate metric records may be retained after deletion for security and abuse prevention.',
      },
      {
        title: 'Deletion and recovery',
        body: 'You can schedule account deletion from the app with your password. The account is deactivated and stops being shown, but can be recovered by logging in within the following 30 days. If you do not recover it, your personal data and profile are deleted. Recovery automatically cancels the scheduled deletion.',
      },
      {
        title: 'Security',
        body: 'We apply reasonable technical and organizational measures: bcrypt password hashing, expiring verification and reset tokens, HTTPS, access control, usage limits and data minimization. No system is completely infallible. If you detect a security incident, write to us immediately at soporte@duolan.online.',
      },
      {
        title: 'Your rights',
        body: 'You can delete your account from the app or request access, rectification, updating, confidentiality or objection to processing by writing to soporte@duolan.online. You can also request information about the use of your data and revoke push consent from your browser settings. In Argentina you may contact the Agency for Access to Public Information if you believe your request was not handled correctly.',
      },
      {
        title: 'Minors',
        body: 'Duo LAN is exclusively for people aged 18 or older. We do not create accounts for minors or deliberately collect their data. If we detect an account belonging to a minor, we will suspend it and delete the applicable data.',
      },
      {
        title: 'Changes and contact',
        body: 'We may update this policy to reflect product, provider or legal changes. We will publish the current version on this page. Privacy questions are received at soporte@duolan.online.',
      },
    ],
  },
  riot: {
    title: 'Riot notice',
    updated: 'October 2026',
    sections: [
      {
        title: 'No affiliation',
        body: 'Duo LAN is an independent project for the League of Legends community on the LAN server. It is not affiliated with, endorsed by, sponsored by or officially associated with Riot Games. Riot Games and League of Legends are trademarks of Riot Games, Inc. The full notice required by Riot is shown at the bottom of this page.',
      },
      {
        title: 'Assets and trademarks',
        body: 'In the MVP we do not use rank crests, logos or other official Riot assets. Duo LAN rank shields are original SVG illustrations. If Riot authorizes the use of specific assets in the future, we will update this page and the product documentation before adding them.',
      },
      {
        title: 'Declared data and API',
        body: 'Rank, roles and schedule are declared by each player. In the MVP we do not query the Riot API or use Riot Sign On, so we do not automatically verify account ownership. If we integrate the API with a production key in the future, ownership verification will require RSO and the player will have to authorize it.',
      },
      {
        title: 'Permitted use',
        body: 'Duo LAN does not sell accounts, offer duo boost, provide coaching services or organize games. Any service of that kind is outside the product scope and is not authorized on the platform.',
      },
      {
        title: 'Contact',
        body: 'Questions about this notice or the use of trademarks: soporte@duolan.online.',
      },
    ],
  },
};
