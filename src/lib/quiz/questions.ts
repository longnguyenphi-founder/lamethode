// Source: "La Methode - 15 câu hỏi ver 1.md"

export type ArchetypeCode =
  | "NNT" | "NBD" | "AH" | "NCS" | "NTH" | "KNL"
  | "NTI" | "NST" | "THE" | "HGI" | "PTS" | "NLD";

export type Archetype = {
  code: ArchetypeCode;
  /** Report page id, matches src/content/reports/<slug>.json */
  slug: string;
  /** Display name, as used in the report documents */
  name: string;
  english: string;
  motivation: string;
};

export const ARCHETYPES: Record<ArchetypeCode, Archetype> = {
  NNT: { code: "NNT", slug: "innocent", name: "Thiếu Nữ Ngây Thơ", english: "Innocent", motivation: "Tin vào điều tốt đẹp, tìm sự an toàn và hạnh phúc đơn giản." },
  NBD: { code: "NBD", slug: "everyman", name: "Người Bình Thường / Công Dân", english: "Everyman", motivation: "Thuộc về, kết nối, được là chính mình cùng mọi người." },
  AH: { code: "AH", slug: "hero", name: "Chiến Binh", english: "Hero", motivation: "Chứng minh giá trị bản thân qua thử thách và chiến thắng." },
  NCS: { code: "NCS", slug: "caregiver", name: "Người Chăm Sóc", english: "Caregiver", motivation: "Bảo vệ, nuôi dưỡng, giúp đỡ người khác." },
  NTH: { code: "NTH", slug: "explorer", name: "Nhà Thám Hiểm", english: "Explorer", motivation: "Tự do, trải nghiệm mới, không bị ràng buộc." },
  KNL: { code: "KNL", slug: "rebel", name: "Kẻ Nổi Loạn", english: "Rebel", motivation: "Phá vỡ khuôn mẫu, sống thật, chống lại áp đặt." },
  NTI: { code: "NTI", slug: "lover", name: "Người Tình", english: "Lover", motivation: "Kết nối sâu sắc, đam mê, được yêu và yêu." },
  NST: { code: "NST", slug: "creator", name: "Nhà Sáng Tạo", english: "Creator", motivation: "Tạo ra cái mới, để lại dấu ấn." },
  THE: { code: "THE", slug: "jester", name: "Chú Hề / Người Vui Vẻ", english: "Jester", motivation: "Sống vui, tận hưởng hiện tại, mang niềm vui cho người khác." },
  HGI: { code: "HGI", slug: "sage", name: "Nhà Hiền Triết", english: "Sage", motivation: "Thấu hiểu, tìm sự thật, chia sẻ tri thức." },
  PTS: { code: "PTS", slug: "magician", name: "Pháp Sư / Nhà Giả Kim", english: "Magician", motivation: "Chuyển hoá, biến điều không thể thành có thể." },
  NLD: { code: "NLD", slug: "ruler", name: "Nhà Cai Trị / Nữ Hoàng", english: "Ruler", motivation: "Kiểm soát, tạo trật tự, dẫn dắt." },
};

export type QuizOption = {
  text: string;
  /** null = context question, not scored (câu 14–15) */
  archetype: ArchetypeCode | null;
};

export type QuizQuestion = {
  id: number;
  category: string;
  text: string;
  options: QuizOption[];
};

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: "Phản xạ tự nhiên",
    text: "Ê, tự nhiên bị thả vào một tình huống hoàn toàn lạ, chưa chuẩn bị gì hết, phản xạ đầu tiên của bạn là gì?",
    options: [
      { text: "Kệ đi, rồi mọi thứ sẽ ổn thôi, mình cứ tích cực lên", archetype: "NNT" },
      { text: "Hào hứng á, không biết nó dẫn mình tới đâu mới vui", archetype: "NTH" },
      { text: "Ok thử thách, để xem mình cân được không", archetype: "AH" },
      { text: "Khoan đã, để mình quan sát tí đã rồi tính", archetype: "HGI" },
    ],
  },
  {
    id: 2,
    category: "Bản ngã",
    text: "Lúc nào bạn thấy mình đang “sống đúng chất mình” nhất?",
    options: [
      { text: "Lúc được yêu thương và ở cạnh người mình thương", archetype: "NTI" },
      { text: "Lúc làm ra được cái gì đó chưa ai từng làm", archetype: "NST" },
      { text: "Lúc được là chính mình, không cần fit vào đâu cả", archetype: "KNL" },
      { text: "Lúc mình chăm sóc, lo cho người khác được", archetype: "NCS" },
    ],
  },
  {
    id: 3,
    category: "Kết nối",
    text: "Trong hội bạn thân, bạn thường là đứa nào?",
    options: [
      { text: "Đứa chọc cười cả nhóm, mang vibe vui", archetype: "THE" },
      { text: "Đứa hay đứng ra chốt, quyết định", archetype: "NLD" },
      { text: "Đứa dễ chill với ai cũng được", archetype: "NBD" },
      { text: "Đứa được réo tới xin lời khuyên mỗi khi có drama", archetype: "HGI" },
    ],
  },
  {
    id: 4,
    category: "Nỗi sợ thầm kín",
    text: "Thành thật đi, điều gì làm bạn sợ nhất?",
    options: [
      { text: "Bị quên lãng, không ai nhớ tới mình nữa", archetype: "NLD" },
      { text: "Bị kiểm soát, mất quyền tự do của mình", archetype: "KNL" },
      { text: "Bị nhìn như một người bình thường, chẳng có gì nổi bật", archetype: "AH" },
      { text: "Bị tổn thương trong chuyện tình cảm", archetype: "NTI" },
    ],
  },
  {
    id: 5,
    category: "Tầm nhìn",
    text: "Khi nghĩ về tương lai, đầu bạn thường vẽ ra cảnh nào?",
    options: [
      { text: "Đi thật nhiều nơi, trải nghiệm thật nhiều thứ mới", archetype: "NTH" },
      { text: "Mọi chuyện rồi sẽ đẹp hơn, mình tin vậy", archetype: "NNT" },
      { text: "Mình xây được cái gì đó thật lớn, để lại dấu ấn", archetype: "NST" },
      { text: "Không nghĩ xa quá đâu, sống ngày nào biết ngày đó", archetype: "NBD" },
    ],
  },
  {
    id: 6,
    category: "Động lực",
    text: "Đi làm/đi học, cái bạn care nhất là gì?",
    options: [
      { text: "Được tự do làm theo cách của mình, không bị bó", archetype: "NST" },
      { text: "Được công nhận vì năng lực thật sự", archetype: "AH" },
      { text: "Giúp được team, support được mọi người", archetype: "NCS" },
      { text: "Có tiếng nói, được quyết định hướng đi", archetype: "NLD" },
    ],
  },
  {
    id: 7,
    category: "Sức hút",
    text: "Kiểu người nào khiến bạn “đổ” (theo nghĩa bị cuốn hút ấy)?",
    options: [
      { text: "Người sống thật, không sợ khác người", archetype: "KNL" },
      { text: "Người sâu sắc, nói gì cũng thấm", archetype: "HGI" },
      { text: "Người hài hước, ở cạnh là thấy nhẹ đầu", archetype: "THE" },
      { text: "Người bí ẩn, kiểu càng tìm hiểu càng cuốn", archetype: "PTS" },
    ],
  },
  {
    id: 8,
    category: "Ứng biến",
    text: "Lúc mọi thứ đang rối tung lên, bạn xử lý sao?",
    options: [
      { text: "Tin là ổn thôi, chuyện gì rồi cũng qua", archetype: "NNT" },
      { text: "Nghĩ cách biến cái rủi này thành cơ hội", archetype: "PTS" },
      { text: "Đối đầu luôn, né làm gì cho mệt", archetype: "AH" },
      { text: "Nhắn ngay cho ai đó để dựa vào, than thở tí", archetype: "NBD" },
    ],
  },
  {
    id: 9,
    category: "Niềm tự hào",
    text: "Cái gì ở bản thân khiến bạn tự hào nhất?",
    options: [
      { text: "Mình biết chăm, biết lo cho người khác", archetype: "NCS" },
      { text: "Mình tạo ra được những thứ độc, lạ, chưa ai nghĩ tới", archetype: "NST" },
      { text: "Mình yêu hết mình và cũng được yêu lại xứng đáng", archetype: "NTI" },
      { text: "Mình dám khác biệt, không chạy theo số đông", archetype: "KNL" },
    ],
  },
  {
    id: 10,
    category: "Dấu ấn",
    text: "Sau này bạn muốn người ta nhớ về mình như một người...",
    options: [
      { text: "Luôn mang lại tiếng cười cho mọi người", archetype: "THE" },
      { text: "Đáng tin, gần gũi, kiểu ai cũng thấy dễ chịu", archetype: "NBD" },
      { text: "Có tầm nhìn, dẫn dắt được cả một đội", archetype: "NLD" },
      { text: "Hiểu chuyện, sâu sắc, ai cũng tìm tới xin ý kiến", archetype: "HGI" },
    ],
  },
  {
    id: 11,
    category: "Thế giới số",
    text: "Feed mạng xã hội của bạn thường ngập content kiểu gì?",
    options: [
      { text: "Mấy câu quote truyền cảm hứng, năng lượng tích cực", archetype: "NNT" },
      { text: "Check-in, đi đây đi đó, trải nghiệm mới", archetype: "NTH" },
      { text: "Quan điểm cá nhân, cà khịa cũng được, thích thì nói", archetype: "KNL" },
      { text: "Về relationship, cảm xúc, mấy chuyện của tim", archetype: "NTI" },
    ],
  },
  {
    id: 12,
    category: "Trực giác",
    text: "Đứng trước một quyết định quan trọng, bạn dựa vào cái gì để chốt?",
    options: [
      { text: "Cảm giác, trực giác của mình", archetype: "NTI" },
      { text: "Phân tích kỹ, nhìn sâu vào bản chất vấn đề", archetype: "HGI" },
      { text: "Cái gì tốt nhất cho cả team/nhóm mình đang gánh", archetype: "NLD" },
      { text: "Cái nào khiến mình thấy tự do nhất, không bị gò", archetype: "PTS" },
    ],
  },
  {
    id: 13,
    category: "Thành công",
    text: "Với bạn, “thành công” thực ra là gì?",
    options: [
      { text: "Làm được thứ để đời, để lại di sản", archetype: "NST" },
      { text: "Vượt qua được giới hạn của chính mình", archetype: "AH" },
      { text: "Sống nhẹ nhàng, vui là chính, đừng áp lực quá", archetype: "THE" },
      { text: "Được là mình mà vẫn được thương, được chấp nhận", archetype: "NNT" },
    ],
  },
  {
    id: 14,
    category: "Trăn trở hiện tại",
    text: "Dạo này điều gì khiến bạn suy nghĩ nhiều nhất?",
    options: [
      { text: "Mình đang đi đúng hướng với công việc/sự nghiệp chưa?", archetype: null },
      { text: "Mình có đang ở trong những mối quan hệ phù hợp không?", archetype: null },
      { text: "Mình thực sự muốn gì và mình là người như thế nào?", archetype: null },
      { text: "Làm sao để mình có một cuộc sống ổn định và tự chủ hơn?", archetype: null },
    ],
  },
  {
    id: 15,
    category: "Khởi đầu mới",
    text: "Nếu có một “nút reset” giúp bạn giải quyết một điều trong cuộc sống hiện tại, bạn muốn reset điều gì nhất?",
    options: [
      { text: "Công việc / sự nghiệp của mình", archetype: null },
      { text: "Chuyện tình cảm / các mối quan hệ", archetype: null },
      { text: "Cách mình hiểu và phát triển bản thân", archetype: null },
      { text: "Tài chính / khả năng tự chủ", archetype: null },
    ],
  },
];
