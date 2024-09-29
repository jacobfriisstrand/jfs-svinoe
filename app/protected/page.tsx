import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint saepe aperiam nisi amet deserunt officia pariatur itaque, autem eius ratione rerum consequatur quas quod temporibus molestiae est deleniti. Dolor, doloremque iure blanditiis cumque molestias numquam et quod
      repellendus corrupti molestiae temporibus fugiat quae mollitia aperiam dolores unde inventore saepe dolore, animi dolorem nulla expedita sit provident necessitatibus? Cumque optio alias laborum porro sit, non ut saepe doloremque? Illo atque aperiam deleniti minus ullam
      explicabo ex autem expedita cum qui, iste a quisquam harum fuga totam omnis enim assumenda, vitae nihil magnam in accusamus? Adipisci quis itaque nam ex et voluptas, excepturi iste velit necessitatibus voluptatem repudiandae, nihil dolor quae quisquam magni minus soluta
      quod voluptates. Maiores deleniti placeat temporibus molestiae ut voluptatum error, quaerat pariatur quasi soluta, voluptates magni quibusdam impedit tempore! Architecto magni reprehenderit, qui quae velit corporis nemo! Natus dolores harum corporis at dignissimos magnam
      temporibus possimus excepturi quasi voluptatem ipsa explicabo, qui, corrupti ut fuga rem ab iusto impedit ipsum maiores veritatis, quae dicta officiis. Officiis facilis cum explicabo fugiat laborum voluptates, autem totam perspiciatis eum laboriosam nobis aspernatur
      aperiam, quo amet. Aliquid molestiae sit quidem laudantium quis. Illo, aspernatur nisi perferendis vel amet tempore non dolor aut et reprehenderit id, suscipit labore dolorum cum magnam natus ex pariatur veritatis cumque laborum optio! Quidem inventore eveniet officiis,
      tempore adipisci magnam totam distinctio possimus, ipsa quas, a delectus aliquid mollitia quisquam doloribus fugit maxime eaque pariatur suscipit. Provident at laboriosam molestiae! Quae pariatur, aut minus incidunt fugit cumque voluptatibus recusandae natus accusantium ab
      quia! Animi quaerat in ex natus. A explicabo perspiciatis veniam suscipit ipsam earum. Sint unde inventore deleniti eaque nesciunt eius. Reprehenderit quisquam quae deserunt rem dignissimos minima perspiciatis dolore suscipit, temporibus autem est iste officiis molestias
      vitae praesentium sequi doloremque facilis similique voluptate amet? Similique corrupti quaerat itaque consequatur deserunt placeat debitis maiores tempore magni eum tempora unde aut voluptatum officiis illo atque nihil dolorem, minus, beatae aspernatur? Earum ipsa vitae,
      perspiciatis soluta ipsam adipisci natus voluptatum, porro asperiores nostrum facere est magnam quasi modi sequi, officiis molestias? Reiciendis cupiditate eum, ut fugiat tenetur facere sapiente aut error eveniet rerum ex nisi voluptatem voluptates! Placeat, a ipsam
      temporibus modi et repudiandae reiciendis ab aperiam eius tempora molestias eaque at optio, saepe facilis ipsa esse asperiores aliquid cumque ipsum? Voluptas possimus obcaecati sit quidem eius totam ducimus odit qui et sequi? Quo, eaque tempore, quia autem illum maiores
      alias saepe ducimus excepturi dolor, magni dolorum. Provident, modi dolor mollitia repellendus est rerum itaque recusandae iste earum possimus repudiandae perspiciatis labore? Aperiam, officia tenetur asperiores aliquid itaque minima modi porro iusto quidem fuga eum aliquam
      nihil praesentium animi blanditiis voluptatum totam? Maxime error iste voluptate id. Voluptas labore eligendi dolore debitis alias, ducimus voluptatum ratione nostrum tempora, id tempore. Unde sint veniam officiis molestias id, deleniti minima ullam expedita culpa rerum!
      Odio odit cumque assumenda, dolores reiciendis, quisquam sequi facere consectetur ullam nisi officiis necessitatibus exercitationem veniam minus culpa, doloremque eaque voluptatum recusandae? Quia veniam, blanditiis tempore consequatur neque quis ullam odio unde facilis
      earum eveniet officiis similique deserunt, molestias sit vel? Optio accusantium assumenda facere amet tenetur. Atque nisi omnis delectus ducimus eos mollitia nesciunt, enim, laboriosam totam, sapiente dolorem. Numquam, natus maxime. A vitae totam sunt natus minima, beatae
      dolore nobis libero. Quasi, error quo! Adipisci voluptate blanditiis eum perferendis rem voluptates ullam quis, assumenda unde eligendi odit quia nulla neque mollitia, amet ducimus voluptas accusantium magni doloribus dicta consequuntur? Tempora omnis minus reiciendis,
      ratione quis temporibus magnam, praesentium natus explicabo consectetur ea porro quidem repudiandae! Quam consectetur reiciendis autem ratione non nostrum cumque nam ad maxime doloremque fuga aliquam, iusto soluta incidunt cupiditate quasi laborum libero. Nostrum itaque, a
      modi eos nisi corrupti eius quisquam dolores pariatur aliquid optio culpa dignissimos animi non praesentium cupiditate facere beatae recusandae ut quas. Architecto minus earum qui ratione nesciunt quia iste distinctio quisquam molestiae, nisi, asperiores consequuntur. At
      mollitia sapiente aperiam? Voluptatibus a ratione autem facilis reprehenderit repellat, libero nesciunt, ipsam provident voluptas nostrum sint fugiat voluptatum numquam ex eos rem sit ducimus consequuntur quis in doloribus! Itaque exercitationem labore corrupti dolorum
      tenetur architecto a laboriosam libero, porro recusandae ratione provident tempore maxime cupiditate modi quod dignissimos facere neque natus rem! Vitae, inventore facere ex amet incidunt soluta quos esse eligendi sint quia assumenda blanditiis, odio neque, rerum fugiat qui
      accusamus ullam molestias est. Recusandae, tenetur veritatis voluptatem in quo voluptas laboriosam ducimus eveniet repudiandae aspernatur velit accusantium. Nemo nulla amet dolorum soluta dolor! Voluptas sunt rem ducimus facere modi ex obcaecati voluptatum, soluta officiis,
      praesentium aliquam ratione illo veritatis, iusto explicabo? Vero debitis magnam dolore deleniti quibusdam, dolorum dicta hic sunt eveniet aliquam quo deserunt enim inventore rem quas corrupti excepturi optio ex modi, corporis tempora numquam minus? Nemo saepe unde ex
      itaque nulla architecto, voluptatum magni totam possimus? Culpa nulla illo facilis fugit nihil! Fuga doloribus aspernatur officiis voluptas asperiores ab magni optio, iure cum autem repellendus recusandae adipisci quae rem odit ullam. Velit molestias itaque modi, corporis
      ad perferendis omnis accusantium officiis voluptate sequi iste nemo, laborum possimus maiores quis iusto facere ipsum fugit non veniam. Labore molestias animi ullam, quas aliquid nemo ratione ducimus quo sit consectetur facere accusamus non qui aspernatur blanditiis ex
      veniam cupiditate tempore? Distinctio a vitae velit ipsam? Dolores alias et, totam blanditiis nulla magni sapiente provident, dolore vel harum dolorum ipsa autem rerum eveniet? Natus repellendus omnis molestiae cumque! Officia odio dolores dignissimos! Iure, magnam? Alias
      numquam minus beatae in, nobis iusto ullam voluptatibus similique odio assumenda, quos sunt reprehenderit, quasi mollitia distinctio deserunt reiciendis? Ipsa, maiores nisi veniam excepturi placeat ab aliquam veritatis vero officiis ullam sit consectetur modi nulla
      accusamus eos reprehenderit aut cupiditate unde maxime tempora sunt illum dignissimos necessitatibus sapiente! Nulla id ab unde neque cum adipisci perspiciatis, iure aliquam repellendus. Mollitia a aliquam suscipit modi doloremque et quisquam minima voluptatibus neque,
      repellendus perspiciatis provident maxime officia quae rem beatae inventore magni id explicabo libero perferendis architecto? At suscipit velit officiis iste itaque dolorum.
    </p>
  );
}
