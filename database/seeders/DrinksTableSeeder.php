<?php
namespace Database\Seeders;

use App\Models\Group;
use App\Models\Menu;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class DrinksTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $menu = Menu::first();

        DB::table('groups')->insert($this->getGroups($menu));

        $groups = Group::where('menu_id', $menu->getKey())->get();

        DB::table('drinks')->insert($this->getDrinks($groups));
    }

    public function getGroups(Menu $menu)
    {
        return [
            [
                'name' => 'Cocktails',
                'menu_id' => $menu->getKey(),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Café',
                'menu_id' => $menu->getKey(),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Thé',
                'menu_id' => $menu->getKey(),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Boissons sans alcool',
                'menu_id' => $menu->getKey(),
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];
    }

    public function getDrinks(Collection $groups)
    {
        return [
            [
                'group_id' => $groups->firstWhere('name', 'Cocktails')->getKey(),
                'name' => 'Sex on the beach',
            ],
            [
                'group_id' => $groups->firstWhere('name', 'Cocktails')->getKey(),
                'name' => 'Mojito',
            ],
            [
                'group_id' => $groups->firstWhere('name', 'Cocktails')->getKey(),
                'name' => 'Blue lagoon',
            ],
        ];
    }
}
