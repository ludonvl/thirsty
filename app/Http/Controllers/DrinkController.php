<?php

namespace App\Http\Controllers;

use App\Http\Requests\DrinkRequest;
use App\Models\Drink;
use App\Models\Group;
use App\Models\Menu;
use App\Services\CocktailsData;
use Illuminate\Http\Request;
use App\Helpers\Helper;

class DrinkController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function create()
    {
        $menuId = Menu::where('user_id', auth()->user()->id)->firstOrFail()->getKey();

        $groups = Group::where('menu_id', $menuId)->get();

        $cocktails = (new CocktailsData())->getDatas();

        return view('drink.create', compact('menuId', 'groups', 'cocktails'));
    }

    public function show(string $id)
    {
        return view('drink.edit', ['drink' => Drink::findOrFail($id)]);
    }

    public function store(Request $request)
    {
        $drink = new Drink();

        $drink->fill($request->all());
        $drink->save();

        return back()->withStatus(__('Boisson créé avec succès.'));
    }

    public function update(DrinkRequest $request, string $id)
    {
        $drink = Drink::findOrFail($id)->update();
        $drink->fill($request->all());
        $drink->save();

        return back()->withStatus(__('Boisson mis à jour avec succès.'));
    }

    public function destroy(string $id)
    {
        Drink::where('id', $id)->delete();
        return back()->withStatus(__('Boisson supprimé.'));
    }
}
