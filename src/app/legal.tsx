import { ScrollView, Text } from 'react-native';

import { Sub, Title } from '@/components/ui';
import { useTheme } from '@/lib/theme';

/** Textos legales básicos. Revisar con un asesor y completar los datos del titular antes del lanzamiento. */
const SECTIONS: [string, string][] = [
  ['Quién es el responsable', 'Brasa (titular y datos de contacto pendientes de completar antes del lanzamiento).'],
  [
    'Qué datos guardamos',
    'Tu nombre, foto, descripción y código postal; tus favoritos, alertas y las valoraciones de otras plataformas que tú añades. Durante la beta todo se guarda solo en tu dispositivo y cifrado (AES-256 en la web; llavero del sistema en el móvil).',
  ],
  ['Para qué los usamos', 'Para mostrarte chollos cerca de ti, calcular distancias y envíos, y mostrar tu reputación como vendedor. Tu código postal nunca se muestra a otros usuarios. No usamos analíticas, publicidad ni rastreadores y no vendemos datos.'],
  [
    'Anuncios de otras plataformas',
    'Brasa muestra anuncios y enlaza a la plataforma original. La compra, el pago y el envío se hacen siempre allí, con sus condiciones. Algunos enlaces pueden generar una comisión para Brasa sin coste para ti.',
  ],
  ['Fiabilidad e IA', 'El índice de fiabilidad y el estado estimado por IA son orientativos. Comprueba siempre el anuncio antes de comprar.'],
  ['Tus derechos', 'Puedes consultar, exportar, corregir o borrar tus datos cuando quieras (RGPD). Para llevártelos, usa "Copiar mis datos"; para borrarlo todo, "Borrar mi cuenta y mis datos", ambos en Mi perfil.'],
  ['Cuentas de otras plataformas', 'Brasa nunca pide ni guarda contraseñas de otras apps. Cuando haya vinculación real se hará con el inicio de sesión oficial de cada plataforma (OAuth), que nos da un permiso limitado que puedes retirar cuando quieras.'],
  ['Contenido de usuarios', 'Puedes denunciar cualquier anuncio o bloquear a un vendedor. Revisamos las denuncias y retiramos el contenido que incumpla las normas.'],
];

export default function Legal() {
  const t = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: 18, gap: 14, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
      <Title size={22}>Privacidad y aviso legal</Title>
      {SECTIONS.map(([h, body]) => (
        <Text key={h} style={{ color: t.ink, lineHeight: 21 }}>
          <Text style={{ fontWeight: '700' }}>{h}. </Text>
          {body}
        </Text>
      ))}
      <Sub>Versión beta. Última actualización: noviembre de 2026.</Sub>
    </ScrollView>
  );
}
