<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;

class GroupController extends Controller
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
        return view('group.create');
    }

    public function show(string $id)
    {
        return view('group.edit', ['group' => Group::findOrFail($id)]);
    }

    public function store(Request $request)
    {
        $group = new Group();

        $group->fill($request->all());
        $group->user()->associate(auth()->user()->id);
        $group->save();
        return back()->withStatus(__('Type de boisson créé avec succès.'));
    }

    public function update(Request $request)
    {
        return back()->withStatus(__('Type de boisson mis à jour avec succès.'));
    }

    public function destroy(string $id)
    {
        Group::where('id', $id)->delete();
        return back()->withStatus(__('Type de boissons supprimé.'));
    }
}
